# Language Companion Files

Load the file for each language the analysis touches. In a project with several languages, load one per language. Also record the language and runtime version (Kotlin/JVM versus Kotlin Multiplatform, Java version, Swift version, Node or browser target, .NET version): standard-library availability depends on it.

| Signals | Load |
|---|---|
| `*.kt`, `*.kts`, Kotlin Gradle plugin | [KOTLIN.md](KOTLIN.md) (and [JAVA.md](JAVA.md) only for JVM structures Kotlin lacks; rule 14) |
| `*.java`, `pom.xml`, `build.gradle` without Kotlin | [JAVA.md](JAVA.md) |
| `*.swift`, `Package.swift`, `*.xcodeproj` | [SWIFT.md](SWIFT.md) |
| `*.js`, `*.mjs`, `*.ts`, `*.tsx`, `package.json`, `tsconfig.json` | [JAVASCRIPT-TYPESCRIPT.md](JAVASCRIPT-TYPESCRIPT.md) |
| `*.cs`, `*.csproj`, `*.sln` | [CSHARP.md](CSHARP.md) |
| `*.c`, `*.h` (without C++ sources), C build files (`Makefile`, `CMakeLists.txt`, `meson.build`) | [C.md](C.md) |
| `*.rs`, `Cargo.toml` | [RUST.md](RUST.md) |
| Any other language | [GENERIC.md](GENERIC.md) |
