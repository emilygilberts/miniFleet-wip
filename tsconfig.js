// tsconfig.json
{
    "compilerOptions": {
      "target": "esnext",
      "module": "esnext",
      "moduleResolution": "node",
      "strict": true,
      "jsx": "preserve",
      "esModuleInterop": true,
      "baseUrl": "./",
      "paths": {
        "@/*": ["src/*"]
      }
    },
    "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
    "exclude": ["node_modules"]
  }

