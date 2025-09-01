"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ValidatedInput } from "@/components/ui/validated-input";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationStates, setValidationStates] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: true, // Optional field
    password: false,
    confirmPassword: false,
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const handleValidationChange = (
    field: keyof typeof validationStates,
    isValid: boolean
  ) => {
    setValidationStates((prev) => {
      const newStates = { ...prev, [field]: isValid };

      // Check if all required fields are valid
      const allValid =
        newStates.firstName &&
        newStates.lastName &&
        newStates.email &&
        newStates.password &&
        newStates.confirmPassword;

      setIsFormValid(allValid);
      return newStates;
    });
  };

  const validateConfirmPassword = (value: string) => {
    return value === formData.password;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Нэр оруулна уу";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Овог оруулна уу";
    }

    if (!formData.email.trim()) {
      newErrors.email = "И-мэйл хаяг оруулна уу";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Зөв и-мэйл хаяг оруулна уу";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Нууц үг дор хаяж 6 тэмдэгт байх ёстой";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Нууц үг таарахгүй байна";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setGeneralError("");
    setIsLoading(true);

    try {
      // Register user via API
      await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      // Auto login after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        // Registration successful but login failed, redirect to login page
        router.push("/auth/login?message=Амжилттай бүртгэгдлээ. Нэвтэрнэ үү.");
      }
    } catch (error: any) {
      setGeneralError(
        error.response?.data?.message ||
          error.message ||
          "Бүртгэлд алдаа гарлаа"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  // Don't render register form if already logged in (will redirect)
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Бүртгүүлэх
          </h2>
          <p className="mt-2 text-sm text-gray-600">Шинэ бүртгэл үүсгэнэ үү</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Бүртгүүлэх</CardTitle>
            <CardDescription>Бүх талбарыг бөглөнө үү</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {generalError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {generalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Нэр</Label>
                  <ValidatedInput
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Таны нэр"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    validationType="name"
                    fieldName="Нэр"
                    onValidationChange={(isValid) =>
                      handleValidationChange("firstName", isValid)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Овог</Label>
                  <ValidatedInput
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Таны овог"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    validationType="name"
                    fieldName="Овог"
                    onValidationChange={(isValid) =>
                      handleValidationChange("lastName", isValid)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">И-мэйл хаяг</Label>
                <ValidatedInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  validationType="email"
                  fieldName="И-мэйл хаяг"
                  onValidationChange={(isValid) =>
                    handleValidationChange("email", isValid)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Утасны дугаар</Label>
                <ValidatedInput
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="88999157"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  validationType="phone"
                  fieldName="Утасны дугаар"
                  onValidationChange={(isValid) =>
                    handleValidationChange("phone", isValid)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Нууц үг</Label>
                <ValidatedInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  validationType="password"
                  fieldName="Нууц үг"
                  onValidationChange={(isValid) =>
                    handleValidationChange("password", isValid)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Нууц үг давтах</Label>
                <ValidatedInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  validationType="custom"
                  validationRules={{
                    required: true,
                    custom: validateConfirmPassword,
                  }}
                  fieldName="Нууц үг давтах"
                  onValidationChange={(isValid) =>
                    handleValidationChange("confirmPassword", isValid)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">
                  Аль хэдийн бүртгэлтэй юу?{" "}
                </span>
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Нэвтрэх
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Terms and Privacy */}
        <div className="text-center text-xs text-gray-500">
          Бүртгүүлснээр та манай{" "}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            Үйлчилгээний нөхцөл
          </Link>{" "}
          болон{" "}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            Нууцлалын бодлого
          </Link>
          -той зөвшөөрч байна.
        </div>
      </div>
    </div>
  );
}
