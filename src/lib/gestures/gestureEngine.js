/**
 * Runs a set of gesture definitions against per-frame hand landmarks. Each
 * gesture is a small state machine over its `stages` array — e.g. Shadow
 * Clone is a single-stage sequence (form the seal, hold), while Rasengan is
 * two stages (clench a fist, then open the palm). A stage must be held for
 * its `holdMs` before the machine advances; if the pose is lost mid-stage
 * progress just pauses, but if too long passes since entering a later stage
 * (`gesture.stageTimeoutMs`) the sequence resets to the start. Completing
 * the last stage fires `triggered` once, then the gesture cools down for
 * `gesture.cooldownMs` before it can fire again.
 *
 * Add new techniques later by pushing another `{ id, stages, cooldownMs }`
 * definition into the array passed to the constructor.
 */
export class GestureEngine {
  constructor(gestures) {
    this.gestures = gestures;
    this.state = new Map(
      gestures.map((g) => [
        g.id,
        { stageIndex: 0, stageSince: null, stageEnteredAt: 0, cooldownUntil: 0 },
      ])
    );
  }

  /**
   * @param {any[][]} handsLandmarks
   * @param {number} now performance.now()-style timestamp in ms
   * @returns {{ triggered: string | null, holding: string | null, holdingLabel: string | null, progress: number }}
   */
  update(handsLandmarks, now) {
    let triggered = null;
    let holding = null;
    let holdingLabel = null;
    let progress = 0;

    for (const gesture of this.gestures) {
      const s = this.state.get(gesture.id);

      if (now < s.cooldownUntil) {
        s.stageIndex = 0;
        s.stageSince = null;
        continue;
      }

      const timeoutMs = gesture.stageTimeoutMs ?? Infinity;
      if (s.stageIndex > 0 && now - s.stageEnteredAt > timeoutMs) {
        s.stageIndex = 0;
        s.stageSince = null;
        s.stageEnteredAt = now;
      }

      const stage = gesture.stages[s.stageIndex];
      const posing = stage.match(handsLandmarks);

      if (!posing) {
        s.stageSince = null;
        continue;
      }

      if (s.stageSince == null) s.stageSince = now;
      const held = now - s.stageSince;

      if (held >= stage.holdMs) {
        const isLastStage = s.stageIndex === gesture.stages.length - 1;
        if (isLastStage) {
          triggered = gesture.id;
          s.cooldownUntil = now + gesture.cooldownMs;
          s.stageIndex = 0;
          s.stageSince = null;
        } else {
          s.stageIndex += 1;
          s.stageSince = null;
          s.stageEnteredAt = now;
          holding = gesture.id;
          holdingLabel = gesture.stages[s.stageIndex].label;
          progress = s.stageIndex / gesture.stages.length;
        }
      } else {
        holding = gesture.id;
        holdingLabel = stage.label;
        progress = (s.stageIndex + held / stage.holdMs) / gesture.stages.length;
      }
    }

    return { triggered, holding, holdingLabel, progress };
  }
}
