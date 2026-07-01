# Chat keyboard handling in React Native (Expo)

A reusable pattern for chat screens: message list + bottom composer that stays visible when the keyboard opens, with no extra gap above a bottom tab bar when the keyboard is closed.

**Stack:** React Native, Expo, `react-native-keyboard-controller`, React Navigation (bottom tabs).

---

## Goals

1. **Composer stays visible** — user always sees the input and typed text when the keyboard is open.
2. **No gap above the tab bar** — when the keyboard is closed, the composer sits flush above bottom navigation (no double spacing).
3. **Smooth behavior** — move only the composer with the keyboard; do not resize the whole screen awkwardly.
4. **Tab bar coordination** — hide the tab bar while typing so it does not compete with the composer.

---

## Why not `KeyboardAvoidingView`?

`KeyboardAvoidingView` (including the one from `react-native-keyboard-controller`) works well for **forms** (login, settings). It is a poor default for **chat** (scrollable list + fixed footer input).

| Issue | What happens |
|--------|----------------|
| Wrong `keyboardVerticalOffset` | Offset often includes header + safe area, but the chat layout already starts below the header — offset is applied twice. |
| Whole container resizes | The entire chat column shrinks or pads, which can push the composer off-screen or leave the input behind the keyboard. |
| Tab bar double-counting | Adding `paddingBottom` equal to tab bar height while the tab screen **already** lays out above the tab bar creates a large gap when the keyboard is closed. |

**Rule:** For list + footer input, use **`KeyboardStickyView`** so only the composer translates with the keyboard.

Reference: [Building a chat app | Keyboard Controller](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/guides/building-chat-app)

---

## Architecture

```
App root
└── KeyboardProvider
    └── Bottom tabs (tabBarHideOnKeyboard: true)
        └── Chat screen
            ├── useResizeMode()          # Android only, per screen
            ├── Header (optional)
            └── Chat layout
                ├── Message list (flex: 1)
                └── KeyboardStickyView
                    └── Composer (TextInput + actions)
```

**When the user focuses the input:**

1. `KeyboardProvider` exposes keyboard height to descendants.
2. `useResizeMode()` sets Android `SOFT_INPUT_ADJUST_RESIZE` for that screen.
3. `KeyboardStickyView` moves the composer up with the keyboard.
4. React Navigation hides the tab bar (`tabBarHideOnKeyboard`).
5. The list stays in the upper flex region; optional `keyboardDismissMode` for swipe dismiss on iOS.

---

## Dependencies

```bash
npm install react-native-keyboard-controller
```

Also required (standard Expo setup):

- `react-native-reanimated`
- `react-native-gesture-handler`

Initialize gesture-handler and reanimated **before** other imports in the app entry / root layout.

---

## Step 1 — Wrap the app in `KeyboardProvider`

```tsx
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      {/* navigation tree */}
    </KeyboardProvider>
  );
}
```

All keyboard-controller hooks and components must render inside this provider.

---

## Step 2 — Android: `useResizeMode()` on the chat screen

Call once at the top of the chat screen component:

```tsx
import { useResizeMode } from "react-native-keyboard-controller";

export default function ChatScreen() {
  useResizeMode();

  return (/* ... */);
}
```

This sets `SOFT_INPUT_ADJUST_RESIZE` while mounted and restores the default on unmount, aligning Android window behavior with the keyboard library.

---

## Step 3 — Chat layout: list + sticky composer

Generic layout component pattern:

```tsx
import { View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

type ChatLayoutProps = {
  children: React.ReactNode;   // message list
  composer: React.ReactNode;   // input footer
};

export function ChatLayout({ children, composer }: ChatLayoutProps) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        {composer}
      </KeyboardStickyView>
    </View>
  );
}
```

- **`children`** — `FlatList`, `FlashList`, or `KeyboardChatScrollView` (see advanced section).
- **`composer`** — sibling of the list, **not** a list footer (footer scrolls away; sticky composer does not).
- **`offset`** — see tab bar section below; often `{ closed: 0, opened: 0 }` inside bottom tabs.

### `KeyboardStickyView` vs `KeyboardAvoidingView`

| | `KeyboardStickyView` | `KeyboardAvoidingView` |
|--|----------------------|-------------------------|
| What moves | Footer only | Often entire container |
| List behavior | Unchanged height | Shrinks / reflows |
| Best for | Chat composer | Single-field forms |

---

## Step 4 — Bottom tabs: hide on keyboard, do not pad for tab height

```tsx
<Tabs
  screenOptions={{
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      height: TAB_BAR_HEIGHT + bottomSafeInset,
      paddingBottom: bottomSafeInset,
    },
  }}
/>
```

### Critical: do not double-count tab bar height

React Navigation renders each tab screen in the region **above** the tab bar. The bottom of your chat screen content is already the top of the tab bar.

| Mistake | Result |
|---------|--------|
| `paddingBottom: tabBarHeight` on composer when keyboard closed | Large empty gap above tab bar |
| Correct | `offset: { closed: 0, opened: 0 }` on `KeyboardStickyView` inside tabs |

| Keyboard | Tab bar | Composer position |
|----------|---------|-------------------|
| Closed | Visible | Bottom of screen content (= directly above tab bar) |
| Open | Hidden | `KeyboardStickyView` sits on top of keyboard |

### When you **do** need `offset`

Use non-zero `KeyboardStickyView` offset only when the composer is **not** in a standard tab layout — e.g. full-screen stack, modal, or custom bottom chrome between composer and screen edge:

```tsx
<KeyboardStickyView offset={{ closed: bottomChromeHeight, opened: safeAreaBottom }} />
```

Measure the distance from the composer’s resting position to the physical bottom of the screen.

---

## Step 5 — Message list

Inverted list (common chat pattern):

```tsx
<FlatList
  data={messages}
  inverted={messages.length > 0}
  keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
  keyboardShouldPersistTaps="handled"
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <MessageBubble message={item} />}
/>
```

| Prop | Purpose |
|------|---------|
| `inverted` | Newest messages at bottom; index `0` = latest |
| `keyboardDismissMode` | Swipe keyboard away (iOS interactive) |
| `keyboardShouldPersistTaps` | Send button works while keyboard is open |

Wire the screen:

```tsx
<ChatLayout
  composer={<Composer value={draft} onChangeText={setDraft} onSend={handleSend} />}
>
  <FlatList /* ... */ />
</ChatLayout>
```

---

## Step 6 — Composer (`TextInput`) conventions

```tsx
<TextInput
  multiline
  blurOnSubmit={false}
  scrollEnabled
  style={{ maxHeight: 120 }}
  submitBehavior="newline"
  textAlignVertical="top"
  value={value}
  onChangeText={onChangeText}
/>
```

| Setting | Why |
|---------|-----|
| `multiline` + `maxHeight` | Grows for long messages, then scrolls inside input |
| `blurOnSubmit={false}` | Return = new line (chat UX) |
| `Keyboard.dismiss()` on send | Closes keyboard after posting |

Keep composer padding minimal (e.g. `paddingVertical: 12`). Do **not** add tab-bar height padding when inside bottom tabs.

---

## Common failures and fixes

### Input hidden when keyboard opens

**Cause:** `KeyboardAvoidingView` with incorrect `keyboardVerticalOffset`, or offset includes header/safe area already accounted for by layout.

**Fix:** Remove `KeyboardAvoidingView` from chat; use `KeyboardStickyView` on the composer only.

### Gap between composer and tab bar (keyboard closed)

**Cause:** `paddingBottom` or `KeyboardStickyView` `closed` offset set to full tab bar height inside a tab navigator.

**Fix:** Set `offset={{ closed: 0, opened: 0 }}`; rely on tab layout + `tabBarHideOnKeyboard`.

### Input works on iOS but not Android

**Cause:** Missing `useResizeMode()` or conflicting `android:windowSoftInputMode` in app config.

**Fix:** Call `useResizeMode()` on the chat screen; avoid `adjustPan` globally if it fights the keyboard controller.

---

## Advanced: richer chat behavior

For production chat apps, consider upgrading from bare `FlatList` + `KeyboardStickyView`:

| Need | API |
|------|-----|
| Scroll insets follow keyboard | `KeyboardChatScrollView` |
| Interactive keyboard drag | `KeyboardGestureArea` + matching `nativeID` on `TextInput` |
| Growing multiline input | `extraContentPadding` (`SharedValue`) + `onLayout` on input |
| AI streaming / blank space below last message | `blankSpace` prop on `KeyboardChatScrollView` |

Docs:

- [KeyboardChatScrollView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-chat-scroll-view)
- [KeyboardStickyView](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-sticky-view)
- [Building a chat app](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/guides/building-chat-app)

---

## Implementation checklist

- [ ] `KeyboardProvider` at app root
- [ ] `useResizeMode()` on Android chat screens
- [ ] Layout: `flex: 1` list + `KeyboardStickyView` composer (not list `ListFooterComponent`)
- [ ] Inside bottom tabs: **no** tab-bar height padding on composer when keyboard closed
- [ ] Outside tabs: set `KeyboardStickyView` `offset` to measured bottom chrome height
- [ ] `tabBarHideOnKeyboard: true` on tab navigator
- [ ] Avoid `KeyboardAvoidingView` for chat footers
- [ ] `keyboardShouldPersistTaps="handled"` on list
- [ ] Multiline input with `blurOnSubmit={false}`

---

## Manual test plan

1. Keyboard closed → composer flush above tab bar (no extra gap).
2. Tap input → keyboard open, text visible, tab bar hidden.
3. Multiline typing → input grows to max height, then scrolls internally.
4. Send → keyboard dismisses, composer returns to resting position.
5. iOS → interactive keyboard dismiss; composer follows.
6. Android → repeated open/close; no stuck offset or gap.
7. Rotation (if supported) → composer still aligned.

---

## Minimal end-to-end example

```tsx
// RootLayout.tsx
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack />
    </KeyboardProvider>
  );
}

// ChatScreen.tsx
import { useResizeMode, KeyboardStickyView } from "react-native-keyboard-controller";

export default function ChatScreen() {
  useResizeMode();
  const [draft, setDraft] = useState("");

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        data={messages}
        inverted
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <Bubble item={item} />}
      />
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View style={{ borderTopWidth: 1, padding: 12 }}>
          <TextInput
            multiline
            value={draft}
            onChangeText={setDraft}
            placeholder="Message..."
            style={{ maxHeight: 120 }}
          />
        </View>
      </KeyboardStickyView>
    </View>
  );
}

// Tab navigator
<Tabs screenOptions={{ tabBarHideOnKeyboard: true }} />
```

This is the core pattern: **provider → resize mode → flex list → sticky composer → hide tab bar → no tab-bar padding inside tabs.**
