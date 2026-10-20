/* eslint-disable react/prop-types */
import { WorkbenchRoot } from 'components/pages/workbench';

// The client shell owns the editor and the interpreter it boots; the routed
// docs pane arrives as `children`. Because the shell persists across pane
// navigation, moving between docs never remounts the editor (issue #54).
const WorkbenchLayout = ({ children }) => <WorkbenchRoot>{children}</WorkbenchRoot>;

export default WorkbenchLayout;
