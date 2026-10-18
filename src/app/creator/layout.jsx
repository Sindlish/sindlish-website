import SEO_DATA from 'constants/seo-data';
import buildMetadata from 'utils/get-metadata';

// The creator page is a client component (it reads the GitHub profile live), so
// its metadata lives in this thin segment layout.
export const metadata = buildMetadata(SEO_DATA.creator);

const CreatorLayout = ({ children }) => children;

export default CreatorLayout;
