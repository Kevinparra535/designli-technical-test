# `ui/screens`

One folder per feature screen. A feature folder holds its screen component **and**
its ViewModel:

```
ui/screens/Clients/
├── ClientsScreen.tsx     # observer() component; resolves the VM from the container
└── ClientsViewModel.ts   # @injectable MobX ViewModel (see skills/viewmodel)
```

The screen is wrapped in MobX `observer()`, resolves its ViewModel with
`container.get(TYPES.XxxViewModel)` (memoized), and reads observable state. It
never imports from `data/` or `domain/services`.
