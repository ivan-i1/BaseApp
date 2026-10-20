// i18next picks plural forms (`key_one`, `key_other`, `key_many`) with Intl.PluralRules,
// which Hermes does not fully implement. Without this, every count renders the
// `_other` form ("1 bounces"). The `/polyfill` entry points only install when needed.
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/de';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/es';
import '@formatjs/intl-pluralrules/locale-data/fr';
import '@formatjs/intl-pluralrules/locale-data/it';
import '@formatjs/intl-pluralrules/locale-data/pt';
