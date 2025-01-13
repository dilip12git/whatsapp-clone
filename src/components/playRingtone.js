import { Howl } from "howler";
import { useEffect } from "react";

const useRingTone = ({ playRingtone, isRinging }) => {
  useEffect(() => {
    let ringtone;
    if (playRingtone) {
      ringtone = new Howl({
        src: ["/ringtone.mp3"],
        loop: true, 
      });
      ringtone.play();

      return () => {
        ringtone.stop();
      };
    }
  }, [playRingtone]);

  useEffect(() => {
    let callRing;
    if (isRinging) {
      callRing = new Howl({
        src: ["/callring.mp3"],
        loop: true,
      });
      callRing.play();

      return () => {
        callRing.stop(); 
      };
    }
  }, [isRinging]);
};

export default useRingTone;
