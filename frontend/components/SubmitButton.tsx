import { useTranslation } from "react-i18next";

import { PrimaryPillButton } from "./PrimaryPillButton";

type SubmitButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function SubmitButton({
  onPress,
  loading = false,
  disabled = false,
}: SubmitButtonProps) {
  const { t } = useTranslation();

  return (
    <PrimaryPillButton
      disabled={disabled}
      label={t("confirm.submit")}
      loading={loading}
      onPress={onPress}
    />
  );
}
