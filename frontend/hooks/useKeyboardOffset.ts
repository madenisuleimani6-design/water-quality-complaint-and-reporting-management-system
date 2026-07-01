import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

import { isWeb } from "../utils/platform";

export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (isWeb) {
      if (typeof window === "undefined") {
        return;
      }

      const viewport = window.visualViewport;
      if (!viewport) {
        return;
      }

      const update = () => {
        const keyboardHeight = Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop,
        );
        setOffset(keyboardHeight);
      };

      update();
      viewport.addEventListener("resize", update);
      viewport.addEventListener("scroll", update);
      return () => {
        viewport.removeEventListener("resize", update);
        viewport.removeEventListener("scroll", update);
      };
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setOffset(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return offset;
}
