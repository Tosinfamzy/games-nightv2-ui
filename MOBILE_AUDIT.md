# Mobile Responsiveness Audit Checklist

**Date:** 2025-12-21  
**Status:** In Progress

## Viewport & Meta Tags

- [ ] Viewport meta tag configured in index.html
- [ ] Touch zoom enabled for accessibility
- [ ] No horizontal scrolling on mobile viewports

## Pages to Audit

### Homepage/Landing (/)

- [ ] Mobile portrait (375px): Layout renders correctly
- [ ] Mobile landscape (667px): No overflow
- [ ] Touch targets ≥44px

### Session List (/sessions)

- [ ] Session cards stack properly on mobile
- [ ] "New Session" button accessible
- [ ] Grid switches to single column on mobile
- [ ] Empty state looks good on mobile

### Create Session (/sessions/new)

- [ ] All form inputs ≥16px font size (prevent zoom on iOS)
- [ ] Date picker works on mobile browsers
- [ ] Submit button ≥44px height
- [ ] Keyboard doesn't hide form elements

### Join Session (/join, /join/:code)

- [ ] Join code input uses numeric keyboard (inputMode="numeric")
- [ ] Player name input doesn't zoom on focus
- [ ] Form fits in viewport with keyboard open
- [ ] 6-digit code input is easy to use on mobile

### Session Details (/sessions/:id)

- [ ] Tabs scroll horizontally on small screens
- [ ] Player cards stack vertically on mobile
- [ ] Action buttons are full-width or properly sized
- [ ] QR code is visible and scannable (min 200px)
- [ ] Team formation interface works on mobile
- [ ] Game cards stack appropriately

### Game View

- [ ] Game controls are touch-friendly
- [ ] Scoreboard is readable on mobile
- [ ] Timer is visible
- [ ] Turn indicator is clear

### Chat (/sessions/:id - chat tab)

- [ ] Chat container adjusts for mobile keyboard
- [ ] Input field stays visible when keyboard open
- [ ] Messages scroll properly
- [ ] Send button ≥44px touch target
- [ ] Text input ≥16px to prevent zoom

### Settings (/settings)

- [ ] Notification toggles ≥44px
- [ ] All controls are tappable
- [ ] Text is readable without zoom

## Component-Level Audit

### Modals & Dialogs

- [ ] ShareSessionModal fits in mobile viewport
- [ ] ConfirmDialog is mobile-friendly
- [ ] QR code modal is properly sized
- [ ] Modals have proper max-height for mobile

### Forms

- [ ] CreateSessionForm - all inputs ≥16px
- [ ] JoinSessionForm - numeric keyboard for code
- [ ] ChatInput - textarea doesn't cause layout shift
- [ ] All buttons ≥44px height

### Cards & Lists

- [ ] SessionCard - responsive layout
- [ ] PlayerCard - stacks on mobile
- [ ] TeamCard - readable on small screens
- [ ] GameCard - proper mobile layout

### Navigation

- [ ] Header/navigation is mobile-friendly
- [ ] Links are tappable (≥44px)
- [ ] Menu works on mobile (if hamburger menu exists)

## Breakpoints to Test

### Mobile Portrait

- [ ] 320px (iPhone SE, small Android)
- [ ] 375px (iPhone 13/14 standard)
- [ ] 393px (iPhone 14 Pro)
- [ ] 428px (iPhone 14 Pro Max)

### Mobile Landscape

- [ ] 568px (iPhone SE landscape)
- [ ] 667px (iPhone 8 landscape)
- [ ] 844px (iPhone 14 Pro landscape)

### Tablet

- [ ] 768px (iPad Mini portrait)
- [ ] 820px (iPad Air portrait)
- [ ] 1024px (iPad landscape)

## Common Issues Checklist

### Typography

- [ ] No text smaller than 14px on mobile
- [ ] Line height appropriate for mobile reading
- [ ] No text truncation issues

### Touch Targets

- [ ] All buttons ≥44x44px
- [ ] Links have adequate spacing
- [ ] Form controls are easily tappable
- [ ] No accidental taps on adjacent elements

### Layout

- [ ] No horizontal scrolling
- [ ] Content fits within viewport
- [ ] Proper spacing between elements
- [ ] Images/QR codes scale appropriately

### Forms & Inputs

- [ ] Input font-size ≥16px (iOS zoom prevention)
- [ ] Appropriate input types (tel, email, number)
- [ ] inputMode set correctly (numeric, text, etc.)
- [ ] autocomplete attributes for better UX
- [ ] Labels are visible and associated

### Keyboard Handling

- [ ] Inputs not hidden when keyboard appears
- [ ] Scroll position adjusts for keyboard
- [ ] Submit buttons accessible with keyboard open

### Performance

- [ ] App loads quickly on 4G
- [ ] Scrolling is smooth (60fps)
- [ ] No layout shift during load
- [ ] Images optimized for mobile

## Browser Testing

### iOS

- [ ] Safari iOS (latest)
- [ ] Safari iOS (1 version back)
- [ ] Chrome iOS

### Android

- [ ] Chrome Android (latest)
- [ ] Samsung Internet
- [ ] Firefox Android

## Accessibility

### Screen Reader Support

- [ ] All interactive elements have labels
- [ ] Form inputs have proper labels
- [ ] ARIA labels where appropriate

### Keyboard Navigation

- [ ] Can navigate with tab/shift-tab
- [ ] Focus indicators visible
- [ ] No keyboard traps

## Real Device Testing

### Devices to Test

- [ ] iPhone (any recent model)
- [ ] Android phone (any recent model)
- [ ] iPad or Android tablet

### Scenarios to Test

1. [ ] Join session via QR code scan
2. [ ] Create session on mobile
3. [ ] Navigate all tabs in session details
4. [ ] Send chat messages
5. [ ] Mark player as ready
6. [ ] Create teams
7. [ ] Start game
8. [ ] Submit scores

## Critical Fixes Needed

### High Priority

- [ ] Forms: Ensure all inputs ≥16px font-size
- [ ] Touch targets: All interactive elements ≥44px
- [ ] QR code: Ensure scannable size on mobile
- [ ] Chat: Fix keyboard interaction

### Medium Priority

- [ ] Modals: Ensure fit in mobile viewport
- [ ] Grid layouts: Stack properly on mobile
- [ ] Navigation: Add hamburger menu if needed

### Low Priority

- [ ] Optimize images for mobile
- [ ] Reduce bundle size for faster load
- [ ] Add touch gestures where beneficial

## Notes

- Focus on iPhone and modern Android devices (80% of users)
- Test both portrait and landscape orientations
- Ensure app works offline/with poor connection
- Test with iOS zoom enabled (accessibility)

## Sign-Off

- [ ] All critical issues fixed
- [ ] Tested on 2+ real devices
- [ ] No horizontal scrolling
- [ ] All forms work with mobile keyboards
- [ ] QR codes are scannable
- [ ] Touch targets meet accessibility standards
