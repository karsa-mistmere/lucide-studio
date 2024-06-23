import {
  ChevronRightIcon,
  ChevronUpIcon,
  LogInIcon,
  SettingsIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";

import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useQueryState } from "next-usequerystate";

const nameStepSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required.")
    .min(2, "Name must be at least 2 characters long.")
    .max(50, "Name must be between 2 and 50 characters long.")
    .regex(
      /^[a-z][a-z0-9-]*$/,
      "Name must start with a letter and contain only letters, numbers and dashes.",
    )
    .regex(/^[a-z][a-z0-9-]*[a-z]$/, "Name must not end with a number")
    .transform((value) =>
      value.toLowerCase().replaceAll("-", " ").trim().replaceAll(" ", "-"),
    ),
  branch: z.string().optional(),
});

export type FormStepNamesData = z.infer<typeof nameStepSchema>;

type FormStepNamesProps = {
  onSubmit: (data: FormStepNamesData) => void;
  isPending: boolean;
  defaultValues: Partial<FormStepNamesData> & Record<string, any>;
};

export const FormStepNames = ({
  onSubmit,
  isPending,
  defaultValues,
}: FormStepNamesProps) => {
  const session = useSession();
  const [name, setName] = useQueryState("name", { defaultValue: "" });
  const [branch, setBranch] = useQueryState("branch", { defaultValue: "" });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(
    branch ? true : false,
  );
  const nameStepForm = useForm<z.infer<typeof nameStepSchema>>({
    resolver: zodResolver(nameStepSchema),
    defaultValues: {
      name,
      branch,
      ...defaultValues,
    },
  });

  useEffect(() => {
    nameStepForm.setValue("name", name);
  }, [name, nameStepForm]);

  return (
    <Form {...nameStepForm}>
      <form
        onSubmit={nameStepForm.handleSubmit((vars) => onSubmit(vars))}
        className="space-y-3"
      >
        <FormField
          control={nameStepForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Icon name<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  aria-required
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^\w]+/g, "-");
                    setName(value);
                    field.onChange(value);
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^\w]+/g, " ")
                      .trim()
                      .replaceAll(" ", "-");
                    setName(value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>
                You need to follow the{" "}
                <Button asChild variant="link" className="p-0">
                  <a
                    href="https://lucide.dev/guide/design/icon-design-guide#naming-conventions"
                    target="_blank"
                  >
                    naming conventions
                  </a>
                </Button>{" "}
                for your icon to be accepted.
              </FormDescription>
            </FormItem>
          )}
        />
        {showAdvancedOptions ? (
          <fieldset className="grid gap-6 rounded-lg border p-4 pt-2 relative">
            <legend className="-ml-1 px-1 text-sm font-medium">
              <button
                type="button"
                className="ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                onClick={() => setShowAdvancedOptions(false)}
              >
                Advanced Options
              </button>
            </legend>
            <FormField
              control={nameStepForm.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      aria-required
                      onChange={(e) => {
                        const value = e.target.value;
                        setBranch(value);
                        field.onChange(value);
                      }}
                      placeholder={name ? `studio/${name}` : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
        ) : (
          <Button
            variant="outline"
            className="gap-1 -mr-1 px-2 h-6"
            type="button"
            onClick={() => setShowAdvancedOptions(true)}
          >
            <SettingsIcon className="w-4 h-4" />
            Advanced Options
          </Button>
        )}
        <FormMessage>
          {nameStepForm.formState.errors.root?.serverError.message}
        </FormMessage>
        <DialogFooter>
          <Button className="gap-1.5" disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : session?.data ? (
              <ChevronRightIcon />
            ) : (
              <LogInIcon />
            )}
            {session?.data ? "Next" : "Sign in with GitHub"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
