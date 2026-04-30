import { Turnstile } from "@marsidev/react-turnstile";
import { TURNSTILE_SITE_KEY } from "./constants";

const TurnstileCaptcha = ({ onVerify }) => {
  return (
    <Turnstile
      siteKey={TURNSTILE_SITE_KEY}
      options={{
        theme: "auto",
        size: "normal",
      }}
      onSuccess={(token) => onVerify(token)}
      onExpire={() => onVerify(null)}
      onError={() => onVerify(null)}
    />
  );
};

export default TurnstileCaptcha;
