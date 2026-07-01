import { useCallback, useEffect, useRef, useState } from "react";

import { FlatList, Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useResizeMode } from "react-native-keyboard-controller";

import { useTranslation } from "react-i18next";



import { ChatKeyboardLayout } from "../../components/ChatKeyboardLayout";

import { ContentSheet } from "../../components/ContentSheet";

import { EmptyMessagesState } from "../../components/EmptyMessagesState";

import { GradientHeader } from "../../components/GradientHeader";

import { MessageComposer } from "../../components/MessageComposer";

import { MessageListItem } from "../../components/MessageListItem";

import { ResponsiveShell } from "../../components/ResponsiveShell";

import { theme } from "../../constants/theme";

import { useMessages } from "../../hooks/useMessages";

import { useProfile } from "../../hooks/useProfile";



export default function MessagesScreen() {

  useResizeMode();

  const { t } = useTranslation();

  const flatListRef = useRef<FlatList>(null);

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

  const { messages, sending, error, send, clearError } =

    useMessages(profileSnapshot);



  const scrollToLatest = useCallback(() => {

    if (messages.length === 0) {

      return;

    }

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  }, [messages.length]);



  useEffect(() => {

    scrollToLatest();

  }, [messages.length, scrollToLatest]);



  const handleSend = async () => {

    clearError();

    const ok = await send(draft);

    if (ok) {

      setDraft("");

    }

  };



  const hasMessages = messages.length > 0;



  return (

    <ResponsiveShell variant="light">

      <StatusBar style="dark" />

      <View className="flex-1" style={{ backgroundColor: theme.surface }}>

        <GradientHeader

          subtitle={t("messages.headerSubtitle")}

          title={t("messages.title")}

        />

        <ContentSheet flush className="pb-0">

          <ChatKeyboardLayout

            composer={

              <MessageComposer

                error={error}

                profileComplete={isComplete}

                sending={sending}

                value={draft}

                onChangeText={setDraft}

                onSend={handleSend}

              />

            }

          >

            <FlatList

              ref={flatListRef}

              className="flex-1 px-4"

              contentContainerStyle={{

                flexGrow: 1,

                paddingTop: hasMessages ? 12 : 0,

                paddingBottom: hasMessages ? 12 : 0,

              }}

              data={messages}

              inverted={hasMessages}

              keyboardDismissMode={

                Platform.OS === "ios" ? "interactive" : "on-drag"

              }

              keyboardShouldPersistTaps="handled"

              keyExtractor={(item) => item.id}

              ListEmptyComponent={<EmptyMessagesState />}

              renderItem={({ item }) => <MessageListItem message={item} />}

              showsVerticalScrollIndicator={false}

            />

          </ChatKeyboardLayout>

        </ContentSheet>

      </View>

    </ResponsiveShell>

  );

}

