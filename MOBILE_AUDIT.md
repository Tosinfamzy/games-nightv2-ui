# Mobile Responsiveness Audit Checklist

## Viewport & Meta Tags

- [ ] Viewport meta tag configured (should be in index.html)
- [ ] Touch zoom enabled for accessibility

## Pages to Test

- [ ] / (Home/Landing)
- [ ] /sessions (Session List)
- [ ] /sessions/new (Create Session)
- [ ] /sessions/:id (Session Details - all tabs)
- [ ] /games/:id (Game Details)
- [ ] /settings (Notification Settings)

## Components to Test

- [ ] Navigation/Header
- [ ] SessionCard
- [ ] JoinSessionForm
- [ ] CreateSessionForm
- [ ] QRCodeDisplay
- [ ] SessionReadinessDashboard
- [ ] TeamFormationInterface
- [ ] LiveGameView
- [ ] LiveScoreboard
- [ ] SessionChat
- [ ] ChatInput
- [ ] GameControlPanel
- [ ] NotificationSettings

## Breakpoints to Test

- [ ] Mobile Portrait (320px - 375px - 428px)
- [ ] Mobile Landscape (568px - 667px - 844px)
- [ ] Tablet Portrait (768px - 820px)
- [ ] Tablet Landscape (1024px - 1180px)

## Common Issues

- [ ] Text truncation/overflow
- [ ] Horizontal scrolling
- [ ] Touch targets < 44px
- [ ] Form inputs hidden by keyboard
- [ ] Modals overflow viewport
- [ ] Images/QR codes too small
- [ ] Spacing too tight
- [ ] Buttons overlap

## Test Devices (Chrome DevTools)

- [ ] iPhone SE (375x667)
- [ ] iPhone 14 Pro (393x852)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] iPad Mini (768x1024)
- [ ] iPad Pro (1024x1366)

## Manual Testing Checklist

- [ ] Create session on mobile
- [ ] Join session on mobile
- [ ] Scan QR code with real device
- [ ] View session details on mobile
- [ ] Form teams on mobile
- [ ] Start game on mobile
- [ ] Submit scores on mobile
- [ ] Send chat messages on mobile
- [ ] Test landscape orientation
- [ ] Test with mobile keyboard open
- [ ] Test notification settings on mobile
- [ ] Test toast notifications on mobile
