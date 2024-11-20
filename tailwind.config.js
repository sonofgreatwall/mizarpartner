/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      borderWidth: {
        3: "3px",
      },
      colors: {
        taskinatorBlue: "#33ABEF",
        taskinatorGreen: "#00BA34",
        taskinatorOrange: "#FF9900",
        taskinatorDarkGrey: "#515151",
        taskiantorMedDarkGrey: "#808080",
        taskinatorMedGrey: "#c3c3c3",
        taskinatorLightGrey: "#f3f3f3",
        taskinatorWhite: "#fff",
        taskinatorOffWhite: "#f9f9f9",
        taskinatorRed: "red",
        taskinatorHoverBlue: "#33aaef11",
        taskinatorPaper: "#f8f0e8",
        taskinatorHighlightBlue: "#a5d6f2",
        taskinatorHighlightRed: "#ff9999",
        taskinatorBlack: "black",
        taskinatorHoverGreen: "#47d167",
        taskinatorHoverLightGreen: "#62f083",
        taskinatorPurple: "#7851A9",
        taskinatorHoverPurple: "#7851A91A",
        taskinatorItemBlue: "#33ABEF4D",
        taskinatorHoverOrange: "#FF99001A",
        taskinatorGreenHover: "#00BA341A",
        taskinatorHoverRed: "#FF00001A",
        taskinatorHoverGrey: "#A3A3A31A",
        taskinatorManagedGrey: "#A3A3A3",
        taskinatorAlertRed: "#FF000080",
        taskinatorYellow: "#FFFF00",
        taskinatorMagenta: "#007f7f",
        messageBlue: "#0084ff",
        folder: "#FFD359"
      },
    },
    maxHeight: {
      "3/4": "75%",
      "8.5/10": `85%`,
      "9/10": "90%",
    },
    scale: {
      97: "0.97",
    },

    fontSize: {
      xxs: "0.6rem",
      xs: "0.7rem",
      sm: "0.8rem",
      base: "1rem",
      lg: "1.25rem",
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem",
    },
  },
};
