import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CaptchaProps {
  onChange: (token: string | null) => void;
  error?: string;
}

export function Captcha({ onChange, error }: CaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [siteKey, setSiteKey] = useState<string>('');
  
  useEffect(() => {
    // Reset captcha on error
    if (error) {
      recaptchaRef.current?.reset();
    }
  }, [error]);
  
  useEffect(() => {
    // Get the reCAPTCHA site key from environment variables
    const envSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    
    if (envSiteKey) {
      setSiteKey(envSiteKey);
    } else {
      console.error('reCAPTCHA site key not found in environment variables');
    }
  }, []);

  if (!siteKey) {
    // When no site key is available, still call onChange with null
    // This allows form submission without reCAPTCHA
    useEffect(() => {
      onChange(null);
    }, [onChange]);
    
    return (
      <div className="space-y-2 my-4 text-center">
        <p className="text-sm text-yellow-600">
          reCAPTCHA is currently unavailable. Continue to login without it.
        </p>
        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 my-4">
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onChange}
        />
      </div>
      {error && (
        <div className="text-sm text-red-500 text-center">
          {error}
        </div>
      )}
    </div>
  );
}