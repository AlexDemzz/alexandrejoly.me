import { useEffect, useState } from "react";

export default function useDateTimeParis() {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-GB", {
      timeZone: "Europe/Paris",
      hour12: false,
    })
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Europe/Paris",
          hour12: false,
        })
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return time;
}
