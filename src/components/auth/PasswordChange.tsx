
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

export function PasswordChange() {
  const { changePassword } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  
  const form = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: PasswordChangeForm) => {
    setIsChanging(true);
    
    const response = await changePassword(data.currentPassword, data.newPassword);
    
    setIsChanging(false);
    
    if (response.error) {
      if (response.error === "Current password is incorrect") {
        form.setError("currentPassword", {
          type: "manual",
          message: "Current password is incorrect"
        });
      } else {
        form.setError("root", {
          type: "manual",
          message: response.error
        });
      }
      return;
    }
    
    // Success - reset form
    form.reset();
  };

  return (
    <Card className="bg-otc-card border-otc-active">
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your account password</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="currentPassword"
                      type="password"
                      className="bg-otc-active border-otc-active text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="newPassword">New Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="newPassword"
                      type="password"
                      className="bg-otc-active border-otc-active text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      className="bg-otc-active border-otc-active text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-otc-primary text-black hover:bg-otc-primary/90"
              type="submit" 
              disabled={isChanging}
            >
              {isChanging ? "Changing Password..." : "Change Password"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
