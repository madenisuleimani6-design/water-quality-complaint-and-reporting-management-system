import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetSpringConfigs,
  useBottomSheetTimingConfigs,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
  InteractionManager,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

import { theme } from "../constants/theme";
import { isWeb } from "../utils/platform";

type ProfileBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  sheetName: string;
  dynamic?: boolean;
  snapPoints?: (string | number)[];
  scrollable?: boolean;
};

const contentEnter = FadeInDown.springify()
  .damping(22)
  .stiffness(220)
  .mass(0.85);

function SheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 px-4 pb-4 pt-2">
      <View className="flex-1 pr-3">
        <Text className="font-poppins-bold text-lg text-slate-900">{title}</Text>
        {subtitle ? (
          <Text className="mt-0.5 font-poppins text-sm text-slate-500">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose}>
        <MaterialIcons color={theme.textMuted} name="close" size={24} />
      </Pressable>
    </View>
  );
}

function WebProfileSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  scrollable,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  scrollable: boolean;
}) {
  const body = (
    <Animated.View entering={contentEnter} className="px-4 pb-8 pt-2">
      {children}
    </Animated.View>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        onPress={onClose}
      >
        <Pressable
          className="max-h-[90%] rounded-t-3xl bg-white"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="items-center pt-3">
            <View
              className="h-1.5 w-11 rounded-full"
              style={{ backgroundColor: theme.border }}
            />
          </View>
          <SheetHeader subtitle={subtitle} title={title} onClose={onClose} />
          {scrollable ? (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {body}
            </ScrollView>
          ) : (
            body
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ProfileBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  sheetName,
  dynamic = false,
  snapPoints: snapPointsProp,
  scrollable = true,
}: ProfileBottomSheetProps) {
  if (isWeb) {
    return (
      <WebProfileSheet
        scrollable={scrollable}
        subtitle={subtitle}
        title={title}
        visible={visible}
        onClose={onClose}
      >
        {children}
      </WebProfileSheet>
    );
  }

  return (
    <NativeProfileBottomSheet
      dynamic={dynamic}
      scrollable={scrollable}
      sheetName={sheetName}
      snapPoints={snapPointsProp}
      subtitle={subtitle}
      title={title}
      visible={visible}
      onClose={onClose}
    >
      {children}
    </NativeProfileBottomSheet>
  );
}

function NativeProfileBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  sheetName,
  dynamic = false,
  snapPoints: snapPointsProp,
  scrollable = true,
}: ProfileBottomSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const wasPresentedRef = useRef(false);
  const snapPoints = useMemo(
    () => snapPointsProp ?? ["55%", "90%"],
    [snapPointsProp],
  );

  const springAnimation = useBottomSheetSpringConfigs({
    damping: 58,
    stiffness: 340,
    mass: 0.85,
    overshootClamping: false,
  });

  const timingAnimation = useBottomSheetTimingConfigs({
    duration: 420,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const animationConfigs = Platform.OS === "ios" ? springAnimation : timingAnimation;

  useEffect(() => {
    if (visible) {
      const task = InteractionManager.runAfterInteractions(() => {
        sheetRef.current?.present();
        wasPresentedRef.current = true;
      });
      return () => task.cancel();
    }

    if (wasPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    wasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const header = (
    <SheetHeader subtitle={subtitle} title={title} onClose={handleDismiss} />
  );

  const animatedContent = (
    <Animated.View entering={contentEnter}>{children}</Animated.View>
  );

  const body = scrollable ? (
    <BottomSheetScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {animatedContent}
    </BottomSheetScrollView>
  ) : (
    animatedContent
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      android_keyboardInputMode="adjustResize"
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: theme.card,
      }}
      enableDynamicSizing={dynamic}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: theme.border,
        width: 44,
        height: 5,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      name={sheetName}
      overDragResistanceFactor={2.5}
      snapPoints={dynamic ? undefined : snapPoints}
      stackBehavior="push"
      onDismiss={handleDismiss}
    >
      {dynamic ? (
        <BottomSheetView>
          {header}
          {body}
        </BottomSheetView>
      ) : (
        <>
          {header}
          {body}
        </>
      )}
    </BottomSheetModal>
  );
}
