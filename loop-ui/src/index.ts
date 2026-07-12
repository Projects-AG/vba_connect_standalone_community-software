/**
 * @projects-ag/loop-ui public API — integrable meeting kit + Nest/LiveKit helpers.
 *
 * Also import styles in the host:
 *   import '@projects-ag/loop-ui/styles.css'
 */
import "./styles.css";

export * from "./components/meeting/integrable";
export {
  videoApi,
  livekitUrl,
  getLivekitUrl,
  configureLoopUi,
  useIntegratedMeeting,
  IntegratedMeetingApp,
} from "./integration";
export type { LoopUiConfig } from "./integration";
