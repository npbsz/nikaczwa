/**
 * ============================================================
 *  NIKA AUTOSERWIS - CONFIGURATION FILE
 *  Edit this file to update business info, hours, and notices.
 * ============================================================
 */
window.NIKA_CONFIG = {

  // ----------------------------------------------------------
  //  VACATION / SPECIAL NOTICE BANNER
  //  Set active: true to show the banner, false to hide it.
  // ----------------------------------------------------------
  vacationNotice: {
    active: false, // <-- ZMIEŃ NA false aby ukryć baner / CHANGE TO false to hide banner
    badge: {
      pl: "Komunikat",
      en: "Notice",
      uk: "Повідомлення"
    },
    message: {
      pl: "Przerwa urlopowa w dniach 15–22 sierpnia 2026. Zapraszamy do rezerwacji terminów po urlopie!",
      en: "Vacation break from August 15–22, 2026. We welcome bookings after this period!",
      uk: "Відпустка з 15 по 22 серпня 2026 р. Запрошуємо записуватися на терміни після відпустки!"
    }
  },

  // ----------------------------------------------------------
  //  BUSINESS CONTACT & ADDRESS
  // ----------------------------------------------------------
  business: {
    name: {
      pl: "Nika Autoserwis",
      en: "Nika Auto Repair",
      uk: "Nika Автосервіс"
    },
    tagline: {
      pl: "Profesjonalny serwis samochodowy w Warszawie",
      en: "Professional Auto Service in Warsaw",
      uk: "Професійне автотехобслуговування у Варшаві"
    },
    phone: "+48500123456",
    phoneDisplay: "+48 500 123 456",
    email: "kontakt@nika-autoserwis.pl",
    address: {
      street: "ul. Przykładowa 42",
      postalCode: "02-123",
      city: "Warszawa",
      full: "ul. Przykładowa 42, 02-123 Warszawa"
    },
    nip: "1234567890",

    // ----------------------------------------------------------
    //  OPENING HOURS
    //  daysOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
    //  Set openHour/closeHour to null for closed days
    // ----------------------------------------------------------
    hours: [
      {
        days: { pl: "Poniedziałek – Piątek", en: "Monday – Friday", uk: "Понеділок – П'ятниця" },
        time: "08:00 – 18:00",
        openHour: 8,
        closeHour: 18,
        daysOfWeek: [1, 2, 3, 4, 5]
      },
      {
        days: { pl: "Sobota", en: "Saturday", uk: "Субота" },
        time: "09:00 – 14:00",
        openHour: 9,
        closeHour: 14,
        daysOfWeek: [6]
      },
      {
        days: { pl: "Niedziela", en: "Sunday", uk: "Неділя" },
        time: { pl: "Zamknięte", en: "Closed", uk: "Зачинено" },
        openHour: null,
        closeHour: null,
        daysOfWeek: [0]
      }
    ]
  },

  // ----------------------------------------------------------
  //  INTEGRATIONS
  // ----------------------------------------------------------
  integrations: {
    // Microsoft 365 Bookings - replace with your real Bookings page URL
    microsoftBookingsUrl: "https://outlook.office365.com/owa/calendar/NikaAutoserwis@example.com/bookings/",

    // Google Maps - replace coordinates or query with your actual address
    mapsDestinationQuery: "ul.+Przyk%C5%82adowa+42,+02-123+Warszawa,+Polska",
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d156388.3543850255!2d20.92111263595245!3d52.23306532087532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f01%3A0x72f0be2a88ead3fc!2sWarsaw!5e0!3m2!1spl!2spl!4v1700000000000!5m2!1spl!2spl"
  }
};
