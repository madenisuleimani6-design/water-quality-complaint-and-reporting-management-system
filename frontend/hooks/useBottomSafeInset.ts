import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isWeb } from "../utils/platform";
import { useEffectiveSafeArea } from "./useEffectiveSafeArea";

/** Bottom inset only — home indicator, Android gesture bar, or nav buttons. */
export function useBottomSafeInset() {
  const insets = useSafeAreaInsets();
  const effective = useEffectiveSafeArea();

  return isWeb ? effective.bottom : insets.bottom;
}
