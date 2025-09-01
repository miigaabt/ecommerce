// Environment validation utility
const requiredEnvVars = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_API_URL",
] as const;

const optionalEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(`${envVar} is not set - related features may not work`);
    }
  }

  // Validate NEXTAUTH_SECRET strength
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    warnings.push("NEXTAUTH_SECRET should be at least 32 characters long");
  }

  // Validate URL formats
  if (process.env.NEXTAUTH_URL && !isValidUrl(process.env.NEXTAUTH_URL)) {
    missing.push("NEXTAUTH_URL must be a valid URL");
  }

  if (
    process.env.NEXT_PUBLIC_API_URL &&
    !isValidUrl(process.env.NEXT_PUBLIC_API_URL)
  ) {
    missing.push("NEXT_PUBLIC_API_URL must be a valid URL");
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function logEnvironmentStatus(): void {
  if (process.env.NODE_ENV === "development") {
    const result = validateEnvironment();

    if (!result.isValid) {
      console.error("❌ Environment validation failed:");
      result.missing.forEach((env) => console.error(`  - Missing: ${env}`));
    } else {
      console.log("✅ Environment validation passed");
    }

    if (result.warnings.length > 0) {
      console.warn("⚠️ Environment warnings:");
      result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }
  }
}
