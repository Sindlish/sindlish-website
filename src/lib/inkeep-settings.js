import LINKS from 'constants/links';
import closeIcon from 'icons/close.svg';

const BASE_URL = 'https://sindlish.org';

const inkeepTheme = {
  styles: [
    {
      key: 'neon-inkeep-base',
      type: 'link',
      value: '/inkeep/css/base.css',
    },
    {
      key: 'neon-inkeep-modal',
      type: 'link',
      value: '/inkeep/css/modal.css',
    },
    {
      key: 'neon-inkeep-chat',
      type: 'link',
      value: '/inkeep/css/chat.css',
    },
  ],
  components: {
    AIChatPageWrapper: {
      defaultProps: {
        size: 'expand',
        variant: 'no-shadow',
      },
    },
  },
  tokens: {
    colors: {
      'grayDark.900': '#09090B',
    },
  },
};

const baseSettings = {
  apiKey: process.env.INKEEP_INTEGRATION_API_KEY,
  integrationId: process.env.INKEEP_INTEGRATION_ID,
  organizationId: process.env.INKEEP_ORGANIZATION_ID,
  primaryBrandColor: '#E02424',
  organizationDisplayName: 'Sindlish',
  customIcons: {
    close: { custom: closeIcon.src },
  },
};

const aiChatSettings = {
  aiAssistantName: 'Sindlish AI',
  chatSubjectName: 'Sindlish',
  placeholder: 'How do I get started?',
  introMessage:
    "Hi!\nI'm an AI assistant trained on documentation, help articles, and other content.\n\nAsk me anything about Sindlish.",
  exampleQuestions: [
    'What is Sindlish?',
    'How do I install Sindlish?',
    'How do I write my first program?',
    'How do I get started with the Sindlish docs?',
  ],
  aiAssistantAvatar: {
    light: '/inkeep/images/bot.svg',
    dark: '/inkeep/images/bot-dark.svg',
  },
  userAvatar: '/inkeep/images/user.svg',
  isShareButtonVisible: true,
  shareChatUrlBasePath: `${BASE_URL}${LINKS.docsHome}`,
  getHelpOptions: [
    {
      icon: { builtIn: 'IoChatbubblesOutline' },
      name: 'Sindlish Support',
      action: {
        type: 'open_link',
        url: LINKS.github,
      },
    },
  ],
};

const getInkeepBaseSettings = ({ onEvent, themeMode }) => ({
  ...baseSettings,
  colorMode: {
    forcedColorMode: themeMode,
  },
  theme: inkeepTheme,
  privacyPreferences: {
    optOutFunctionalCookies: true,
  },
  onEvent,
});

export { aiChatSettings, baseSettings, getInkeepBaseSettings };
