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
      pl: "Profesjonalny serwis samochodowy w Częstochowie",
      en: "Professional Auto Service in Częstochowa",
      uk: "Професійне автотехобслуговування у Ченстохові"
    },
    phone: "+48606791204",
    phoneDisplay: "+48 606 791 204",
    email: "kontakt@nika-autoserwis.pl",
    address: {
      street: "ul. Kiedrzyńska 14",
      postalCode: "42-202",
      city: "Częstochowa",
      full: "ul. Kiedrzyńska 14, 42-202 Częstochowa"
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
        time: "08:00 – 17:00",
        openHour: 8,
        closeHour: 17,
        daysOfWeek: [1, 2, 3, 4, 5]
      },
      {
        days: { pl: "Sobota – Niedziela", en: "Saturday – Sunday", uk: "Субота – Неділя" },
        time: { pl: "Zamknięte", en: "Closed", uk: "Зачинено" },
        openHour: null,
        closeHour: null,
        daysOfWeek: [6,0]
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
    mapsDestinationQuery: "50.81929495977339, 19.128152891899784",
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2520.6363495964406!2d19.125681776883184!3d50.81937596073161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4710b5afb1b83635%3A0x84c0d093dc95d3c5!2sNIKA%20wymiana%20oleju%2C%20mechanika!5e0!3m2!1sde!2sde!4v1792503973581!5m2!1sde!2sde"
  }
};
