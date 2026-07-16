import { forwardRef, useImperativeHandle, useRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { TURNSTILE_SITE_KEY } from "./constants";

const TurnstileCaptcha = forwardRef(({ onVerify }, ref) => {
  const turnstileRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      turnstileRef.current?.reset();
    },
  }));

  return (
    <Turnstile
      ref={turnstileRef}
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
});

export default TurnstileCaptcha;
