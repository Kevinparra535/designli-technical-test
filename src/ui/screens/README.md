# `ui/screens`

One folder per feature screen. A feature folder holds its screen component **and**
its ViewModel:

```
ui/screens/Clients/
├── ClientsScreen.tsx     # observer() component; resolves the VM via useViewModel
└── ClientsViewModel.ts   # @injectable MobX ViewModel (see skills/viewmodel)
```

The screen is wrapped in MobX `observer()`, resolves its ViewModel with the
`useViewModel(TYPES.XxxViewModel)` hook (which memoizes `container.get` so the
screen never touches the DI container directly), and reads observable state.

It never imports from `data/` — this is now enforced by the linter via the
`no-restricted-imports` architecture boundaries in `eslint.config.js`.
