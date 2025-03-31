import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Link } from "wouter";
import { Captcha } from "@/components/auth/captcha";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  recaptchaToken: z.string().optional(), // Optional captcha token
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      recaptchaToken: "",
      rememberMe: false,
    },
  });

  const handleCaptchaChange = (token: string | null) => {
    if (token) {
      form.setValue("recaptchaToken", token);
      setCaptchaError(null);
    } else {
      form.setValue("recaptchaToken", "");
      setCaptchaError("CAPTCHA validation failed. Please try again.");
    }
  };

  async function onSubmit(data: LoginFormValues) {
    // Allow login without reCAPTCHA token
    setIsLoading(true);
    try {
      // Pass token as empty string if undefined/null
      const token = data.recaptchaToken || '';
      await login(data.username, data.password, token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("CAPTCHA")) {
          setCaptchaError(error.message);
        } else {
          form.setError("root", { message: error.message });
        }
      } else {
        form.setError("root", { message: "Failed to login" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo textSize="text-3xl" className="justify-center" />
          <p className="text-gray-600">Your secure payment solution</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  <a href="#" className="text-sm font-medium text-primary hover:text-blue-700">
                    Forgot password?
                  </a>
                </div>
                
                {form.formState.errors.root && (
                  <div className="text-sm text-red-500">
                    {form.formState.errors.root.message}
                  </div>
                )}
                
                <Captcha 
                  onChange={handleCaptchaChange} 
                  error={captchaError || form.formState.errors.recaptchaToken?.message}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" className="flex justify-center items-center">
                  <i className="fab fa-google mr-2"></i> Google
                </Button>
                <Button variant="outline" type="button" className="flex justify-center items-center">
                  <i className="fab fa-apple mr-2"></i> Apple
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-center mt-6">
              <p>
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:text-blue-700">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
