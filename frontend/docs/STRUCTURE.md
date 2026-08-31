# Cấu trúc dự án

```
frontend/
├── index.html                  # Entry HTML (chứa <div id="root">)
├── package.json                # Scripts & dependencies
├── vite.config.ts              # Cấu hình Vite (alias "@" -> src/)
├── components.json             # Cấu hình shadcn/ui
├── public/                     # Static assets
├── src/
│   ├── main.tsx                # Entry: mount <App /> vào #root
│   ├── App.tsx                 # Router + AuthProvider + khai báo route
│   ├── index.css               # Tailwind 4 + CSS variables (theme)
│   ├── api/                    # Gọi API backend (axiosClient, auth, job)
│   ├── components/             # Component dùng chung (ui/ là shadcn/ui)
│   ├── context/                # Context toàn cục (auth-context)
│   ├── lib/                    # Tiện ích (utils.ts — hàm cn())
│   └── pages/                  # Các trang (home, login, register)
├── docs/                       # Tài liệu
└── dist/                       # Build output
```

## Các thư mục chính

| Thư mục      | Vai trò                                     |
| ------------ | ------------------------------------------- |
| `src/pages/` | Trang — mỗi file tương ứng 1 route          |
| `src/components/` | Component dùng chung; `ui/` là shadcn/ui |
| `src/api/`   | Mọi lời gọi API + TypeScript types          |
| `src/context/` | State toàn cục (auth, theme)              |
| `src/lib/`   | Hàm tiện ích thuần                          |

> Import path: `@` trỏ tới `src/` (vd: `@/components/ui/button`).