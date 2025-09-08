# Netok MVP (Desktop)

Mono-repo с двумя крейтами: `core` (Apache-2.0) и `desktop` (Iced UI). 

## Сборка

Требуется Rust stable.

```bash
cargo build --release -p desktop
```

## Запуск

```bash
cargo run -p desktop
```

## Лицензии

- core: Apache-2.0 (см. LICENSE.Apache-2.0)
- desktop: OSS, но бинарные релизы могут распространяться по проприетарной лицензии (см. LICENSE.Proprietary)
