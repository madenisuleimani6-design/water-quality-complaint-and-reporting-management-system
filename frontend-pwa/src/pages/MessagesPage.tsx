import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { EmptyMessagesState } from "@/components/messages/EmptyMessagesState";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageListItem } from "@/components/messages/MessageListItem";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { useMessages } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";

export function MessagesPage() {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const { profile, isComplete } = useProfile();
  const [draft, setDraft] = useState("");

  const profileSnapshot = isComplete
    ? {
        phone: profile.phone,
        fullName: profile.fullName,
        email: profile.email,
        area: profile.area,
      }
    : null;

  const { messages, sending, error, send, clearError } = useMessages(profileSnapshot);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    clearError();
    const ok = await send(draft);
    if (ok) setDraft("");
  };

  const hasMessages = messages.length > 0;

  return (
    <TabScreenLayout
      footer={
        <MessageComposer
          error={error}
          profileComplete={isComplete}
          sending={sending}
          value={draft}
          onChangeText={setDraft}
          onSend={handleSend}
        />
      }
      scrollClassName="!px-0"
      subtitle={t("messages.headerSubtitle")}
      title={t("messages.title")}
    >
      <div
        ref={listRef}
        className="flex min-h-full flex-col px-4"
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {hasMessages ? (
          messages.map((item) => <MessageListItem key={item.id} message={item} />)
        ) : (
          <EmptyMessagesState />
        )}
      </div>
    </TabScreenLayout>
  );
}
