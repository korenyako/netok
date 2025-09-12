import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translations inline to avoid JSON import issues
const resources = {
  ru: {
    common: {
      "nodes.computer.name": "Компьютер",
      "nodes.wifi.name": "Wi-Fi",
      "nodes.dns.name": "DNS",
      "nodes.internet.name": "Интернет",
      "summary.ok": "Интернет работает",
      "button.refresh": "Обновить",
      "button.loading": "Обновляем…",
      "status.internet_ok": "Интернет работает",
      "status.internet_partial": "Интернет частично доступен",
      "status.internet_down": "Интернет недоступен",
      "status.ok_short": "Ok",
      "status.partial_short": "Частично",
      "status.down_short": "Нет",
      "status.unknown": "Неизвестно",
      "status.waiting": "Проверяем соединение…",
      "speed.line": "Скорость: {{down}}/{{up}} Мбит/с"
    }
  },
  en: {
    common: {
      "nodes.computer.name": "Computer",
      "nodes.wifi.name": "Wi-Fi",
      "nodes.dns.name": "DNS",
      "nodes.internet.name": "Internet",
      "summary.ok": "Internet works fine",
      "button.refresh": "Refresh",
      "button.loading": "Refreshing…",
      "status.internet_ok": "Internet is up",
      "status.internet_partial": "Internet partially available",
      "status.internet_down": "Internet is down",
      "status.ok_short": "Ok",
      "status.partial_short": "Partial",
      "status.down_short": "Down",
      "status.unknown": "Unknown",
      "status.waiting": "Checking connection…",
      "speed.line": "Speed: {{down}}/{{up}} Mbps"
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',           // temp default; later read saved user setting
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

export default i18next;