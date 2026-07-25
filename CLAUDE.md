# Claude Code Instructions - Games Night V2 Frontend

## Project Overview

React + TypeScript frontend for real-time multiplayer games night application. Uses TanStack Query, TanStack Router, and Socket.IO.

## Critical Rules

### 1. Component Size Limits

- **Route/Page: < 200 lines**
- **Feature Component: < 150 lines**
- **UI Component: < 100 lines**
- If exceeding, extract to sub-components or hooks

### 2. No `any` Types

- Define interfaces for all props
- Type all event handlers
- Use TanStack Query's generic types

### 3. State Management

| Type        | Use             |
| ----------- | --------------- |
| Server data | TanStack Query  |
| Forms       | React Hook Form |
| Global UI   | Context         |
| Local UI    | useState        |

### 4. Mobile First

- Always add responsive classes
- Touch targets minimum 44px: `min-h-[44px]`
- Test at 375px width

### 5. Error Handling

- Always handle loading, error, empty states
- Use toast notifications for user feedback
- Wrap features in error boundaries

## File Structure

```
src/
├── components/          # Shared components
├── hooks/              # Custom hooks (extract logic here)
├── lib/
│   ├── api/services/   # API calls
│   ├── socket/         # WebSocket hooks
│   └── constants/      # Magic numbers here
└── routes/             # Keep routes lean, delegate to components
```

## Patterns to Follow

### Data Fetching

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['games', id],
  queryFn: () => gameService.findOne(id),
})

if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorDisplay error={error} />
```

### Mutations with Feedback

```typescript
const mutation = useMutation({
  mutationFn: createGame,
  onSuccess: () => showToast.success('Game created!'),
  onError: (e) => showToast.error(e.message),
})
```

## Before Committing

- [ ] No `any` types
- [ ] Components < size limits
- [ ] Loading/error states handled
- [ ] Mobile responsive
- [ ] No console.log

## Reference

- Full standards: docs/CODING_STANDARDS.md
