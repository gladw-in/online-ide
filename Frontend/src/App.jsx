import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "./context/ThemeProvider";
import MainBody from "./components/MainBody";
import { RECAPTCHA_SITE_KEY } from "./utils/constants";

const App = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <ThemeProvider>
        <Router>
          <ThemeContext.Consumer>
            {({ isDarkMode, toggleTheme }) => (
              <MainBody isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            )}
          </ThemeContext.Consumer>
        </Router>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  );
};

export default App;
