import CHALLENGES, { CHALLENGE_TYPES, getChallenge } from '../data/challenges.js';

function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

class ChallengeSystem extends EventTarget {
  constructor({ gameState = null, challenges = CHALLENGES, hooks = {} } = {}) {
    super();
    this.gameState = gameState;
    this.challenges = challenges;
    this.hooks = hooks;
    this.reset();
  }

  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  subscribe(type, callback) {
    const handler = (event) => callback(event.detail);
    this.addEventListener(type, handler);

    return () => {
      this.removeEventListener(type, handler);
    };
  }

  setGameState(gameState) {
    this.gameState = gameState;
    return this;
  }

  setHooks(hooks = {}) {
    this.hooks = { ...this.hooks, ...hooks };
    return this;
  }

  reset() {
    this.activeId = null;
    this.activeOptions = null;
    this.roundIndex = -1;
    this.selectedIndex = 0;
    this.totalScore = 0;
    this.roundScores = [];
    this.meterProgress = 0;
    this.lastMeterDirection = null;
    this.roundStartedAt = 0;
    this.attemptNumber = 0;
    this.lastTimerBucket = null;
    this.previousCanMove = true;
    return this;
  }

  getChallenge(challengeId) {
    return this.challenges[challengeId] || getChallenge(challengeId);
  }

  getActiveChallenge() {
    return this.activeId ? this.getChallenge(this.activeId) : null;
  }

  getCurrentRound() {
    const challenge = this.getActiveChallenge();

    if (!challenge || this.roundIndex < 0) {
      return null;
    }

    return challenge.rounds[this.roundIndex] || null;
  }

  isActive() {
    return Boolean(this.getActiveChallenge());
  }

  start(challengeId, options = {}) {
    const challenge = this.getChallenge(challengeId);

    if (!challenge) {
      throw new Error(`ChallengeSystem: unknown challenge "${challengeId}".`);
    }

    if (this.isActive()) {
      this.close({ source: 'replace' });
    }

    const currentResult = this._getStoredResult(challengeId);

    this.activeId = challengeId;
    this.activeOptions = { ...options };
    this.roundIndex = 0;
    this.selectedIndex = 0;
    this.totalScore = 0;
    this.roundScores = [];
    this.meterProgress = 0;
    this.lastMeterDirection = null;
    this.roundStartedAt = options.now ?? Date.now();
    this.attemptNumber = (currentResult?.attempts || 0) + 1;
    this.lastTimerBucket = null;
    this.previousCanMove = this._getCanMoveState();

    const snapshot = this.getSnapshot();
    this._patchUi({
      challengeOpen: true,
      challenge: snapshot,
      canMove: false,
    });

    this.emit('ui:challenge:show', snapshot);
    this.emit('ui:challenge:update', snapshot);
    this._callHook('onChallengeStart', {
      challenge,
      snapshot,
      context: this.activeOptions.context || null,
    });

    return snapshot;
  }

  moveSelection(delta) {
    const challenge = this.getActiveChallenge();

    if (!challenge || challenge.type !== CHALLENGE_TYPES.CHOICE_QUIZ) {
      return this.getSnapshot();
    }

    const round = this.getCurrentRound();
    const optionCount = round?.options?.length || 0;

    if (!optionCount) {
      return this.getSnapshot();
    }

    const nextIndex = (this.selectedIndex + delta + optionCount) % optionCount;
    if (nextIndex === this.selectedIndex) {
      return this.getSnapshot();
    }

    this.selectedIndex = nextIndex;
    return this._emitSnapshot();
  }

  selectIndex(index) {
    const challenge = this.getActiveChallenge();
    const round = this.getCurrentRound();

    if (!challenge || challenge.type !== CHALLENGE_TYPES.CHOICE_QUIZ || !round?.options?.length) {
      return this.getSnapshot();
    }

    const clampedIndex = Math.max(0, Math.min(index, round.options.length - 1));
    if (clampedIndex === this.selectedIndex) {
      return this.getSnapshot();
    }

    this.selectedIndex = clampedIndex;
    return this._emitSnapshot();
  }

  submitSelection(index = this.selectedIndex) {
    const challenge = this.getActiveChallenge();
    const round = this.getCurrentRound();

    if (!challenge || challenge.type !== CHALLENGE_TYPES.CHOICE_QUIZ || !round?.options?.length) {
      return false;
    }

    this.selectedIndex = Math.max(0, Math.min(index, round.options.length - 1));
    const selected = round.options[this.selectedIndex];
    const awardedScore = selected?.score || 0;

    this.roundScores.push(awardedScore);
    this.totalScore += awardedScore;

    if (this.roundIndex < challenge.rounds.length - 1) {
      this.roundIndex += 1;
      this.selectedIndex = 0;
      this.roundStartedAt = Date.now();
      this.lastTimerBucket = null;
      return this._emitSnapshot();
    }

    return this.finish({ source: 'submit' });
  }

  registerMeterInput(code, now = Date.now()) {
    const challenge = this.getActiveChallenge();
    const round = this.getCurrentRound();

    if (!challenge || challenge.type !== CHALLENGE_TYPES.ACTION_METER || !round) {
      return false;
    }

    const direction = this._resolveMeterDirection(round, code);
    if (!direction) {
      return false;
    }

    if (!this.roundStartedAt) {
      this.roundStartedAt = now;
    }

    if (direction !== this.lastMeterDirection) {
      this.lastMeterDirection = direction;
      this.meterProgress = Math.min(round.goal, this.meterProgress + 1);
    }

    if (this.meterProgress >= round.goal) {
      return this.finish({ source: 'meter' });
    }

    return this._emitSnapshot(now);
  }

  update(now = Date.now()) {
    const challenge = this.getActiveChallenge();
    const round = this.getCurrentRound();

    if (!challenge || challenge.type !== CHALLENGE_TYPES.ACTION_METER || !round) {
      return null;
    }

    const remainingMs = this.getTimeRemaining(now);
    if (remainingMs <= 0) {
      return this.finish({ source: 'timeout' });
    }

    const bucket = Math.ceil(remainingMs / 100);
    if (bucket !== this.lastTimerBucket) {
      this.lastTimerBucket = bucket;
      return this._emitSnapshot(now);
    }

    return null;
  }

  getTimeRemaining(now = Date.now()) {
    const challenge = this.getActiveChallenge();
    const round = this.getCurrentRound();

    if (!challenge || challenge.type !== CHALLENGE_TYPES.ACTION_METER || !round) {
      return 0;
    }

    return Math.max(0, round.timeLimitMs - (now - this.roundStartedAt));
  }

  finish({ source = 'finish' } = {}) {
    const challenge = this.getActiveChallenge();

    if (!challenge) {
      return {
        status: 'idle',
        snapshot: this.getSnapshot(),
      };
    }

    const score = challenge.type === CHALLENGE_TYPES.ACTION_METER
      ? (this.meterProgress >= (this.getCurrentRound()?.goal || 0) ? 1 : 0)
      : this.totalScore;
    const maxScore = challenge.maxScore ?? challenge.rounds.length;
    const passed = score >= (challenge.passThreshold ?? maxScore);
    const feedback = challenge.feedback?.[passed ? 'passed' : 'failed'] || {};
    const payload = {
      challengeId: challenge.id,
      type: challenge.type,
      source,
      passed,
      status: passed ? 'passed' : 'failed',
      score,
      maxScore,
      attempts: this.attemptNumber,
      roundIndex: this.roundIndex,
      roundScores: [...this.roundScores],
      meterProgress: this.meterProgress,
      context: this.activeOptions?.context || null,
      feedbackTitle: feedback.title || challenge.title,
      feedbackBody: feedback.body || '',
      feedbackTone: feedback.tone || (passed ? 'hope' : 'warning'),
      snapshot: this.getSnapshot(),
    };

    this._storeResult(payload);
    this._patchUi({
      challengeOpen: false,
      challenge: null,
      canMove: this.previousCanMove,
    });

    this.emit('ui:challenge:hide', payload);
    this.emit('gameplay:challenge-complete', payload);
    this._callHook('onChallengeComplete', payload);
    this.reset();

    return payload;
  }

  close({ source = 'close' } = {}) {
    if (!this.isActive()) {
      return {
        status: 'idle',
        snapshot: this.getSnapshot(),
      };
    }

    const challenge = this.getActiveChallenge();
    const payload = {
      status: 'closed',
      source,
      challengeId: challenge.id,
      snapshot: this.getSnapshot(),
    };

    this._patchUi({
      challengeOpen: false,
      challenge: null,
      canMove: this.previousCanMove,
    });

    this.emit('ui:challenge:hide', payload);
    this.reset();
    return payload;
  }

  getSnapshot(now = Date.now()) {
    const challenge = this.getActiveChallenge();
    const round = this.getCurrentRound();
    const type = challenge?.type || null;

    return {
      active: Boolean(challenge),
      challengeId: challenge?.id || null,
      type,
      title: challenge?.title || '',
      subtitle: challenge?.subtitle || '',
      instructions: challenge?.instructions || '',
      roundIndex: challenge ? this.roundIndex : -1,
      roundCount: challenge?.rounds?.length || 0,
      selectedIndex: this.selectedIndex,
      score: type === CHALLENGE_TYPES.ACTION_METER
        ? (this.meterProgress >= (round?.goal || 0) ? 1 : 0)
        : this.totalScore,
      maxScore: challenge?.maxScore || 0,
      attempts: this.attemptNumber,
      round: round ? cloneValue(round) : null,
      meterProgress: this.meterProgress,
      meterGoal: round?.goal || 0,
      timeRemainingMs: type === CHALLENGE_TYPES.ACTION_METER ? this.getTimeRemaining(now) : 0,
    };
  }

  _emitSnapshot(now = Date.now()) {
    const snapshot = this.getSnapshot(now);
    this._patchUi({ challenge: snapshot });
    this.emit('ui:challenge:update', snapshot);
    return snapshot;
  }

  _resolveMeterDirection(round, code) {
    if (round.leftKeys.includes(code)) {
      return 'left';
    }

    if (round.rightKeys.includes(code)) {
      return 'right';
    }

    return null;
  }

  _storeResult(payload) {
    const result = {
      status: payload.status,
      score: payload.score,
      maxScore: payload.maxScore,
      attempts: payload.attempts,
      completedAt: new Date().toISOString(),
    };

    if (typeof this.gameState?.setChallengeResult === 'function') {
      this.gameState.setChallengeResult(payload.challengeId, result);
      return;
    }

    if (!this.gameState?.state?.progress) {
      return;
    }

    if (!this.gameState.state.progress.learning) {
      this.gameState.state.progress.learning = {
        results: {},
        endingVariant: null,
      };
    }

    this.gameState.state.progress.learning.results[payload.challengeId] = result;
  }

  _getStoredResult(challengeId) {
    if (typeof this.gameState?.getChallengeResult === 'function') {
      return this.gameState.getChallengeResult(challengeId);
    }

    return this.gameState?.state?.progress?.learning?.results?.[challengeId] || null;
  }

  _getCanMoveState() {
    if (typeof this.gameState?.getCanMove === 'function') {
      return Boolean(this.gameState.getCanMove());
    }

    return this.gameState?.state?.ui?.canMove ?? true;
  }

  _patchUi(patch) {
    if (!this.gameState || !patch) {
      return;
    }

    if (typeof this.gameState.updateUIState === 'function') {
      this.gameState.updateUIState(patch);
      return;
    }

    this.gameState.state.ui = {
      ...(this.gameState.state.ui || {}),
      ...patch,
    };
    this.gameState.emit?.('change');
  }

  _callHook(hookName, payload) {
    const hook = this.hooks?.[hookName];

    if (typeof hook === 'function') {
      hook(payload, this);
    }
  }
}

export default ChallengeSystem;
