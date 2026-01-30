import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { t } from "~@/i18n/macro";
import {
	Alert,
	AlertDescription,
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from "~@/ui";

import type { User } from "./types";

const getFormSchema = () =>
	z.object({
		name: z.string().min(2, { message: t`Name must be at least 2 characters.` }),
		email: z.string().email({ message: t`Invalid email address.` }),
		role: z.enum(["admin", "operator", "viewer"]),
		status: z.enum(["active", "disabled"]),
		notes: z.string().optional(),
	});

type FormValues = z.infer<typeof formSchema>;

export interface UserEditorProps {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (user: User) => void;
	currentUserId: string;
}

export function UserEditor({ user, open, onOpenChange, onSave, currentUserId }: UserEditorProps) {
	const formSchema = getFormSchema();
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			role: "operator",
			status: "active",
			notes: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
				notes: user.notes || "",
			});
		} else {
			form.reset({
				name: "",
				email: "",
				role: "operator",
				status: "active",
				notes: "",
			});
		}
	}, [user, form]);

	const onSubmit = (values: FormValues) => {
		const updatedUser: User = {
			id: user?.id || "",
			name: values.name,
			email: values.email,
			role: values.role,
			status: values.status,
			createdAt: user?.createdAt || new Date().toISOString(),
			lastLoginAt: user?.lastLoginAt,
			notes: values.notes || undefined,
		};

		// Prevent self-lockout
		if (user && user.id === currentUserId) {
			if (values.role !== "admin" || values.status === "disabled") {
				form.setError("role", {
					message: t`You cannot demote yourself or disable your own account`,
				});
				return;
			}
		}

		onSave(updatedUser);
	};

	const isSelfEdit = user && user.id === currentUserId;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>{user ? t`Edit User` : t`Create User`}</DialogTitle>
					<DialogDescription>
						{user ? t`Update user information and permissions` : t`Add a new user to the system`}
					</DialogDescription>
				</DialogHeader>

				{isSelfEdit && (
					<Alert className="border-amber-200 bg-amber-50">
						<AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
						<AlertDescription className="text-amber-800">
							{t`You are editing your own account. You cannot demote yourself or disable your account.`}
						</AlertDescription>
					</Alert>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Name`} *</FormLabel>
									<FormControl>
										<Input placeholder={t`John Doe`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Email`} *</FormLabel>
									<FormControl>
										<Input type="email" placeholder={t`john.doe@example.com`} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Role`} *</FormLabel>
									<Select onValueChange={field.onChange} value={field.value} disabled={isSelfEdit}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="admin">{t`Admin`}</SelectItem>
											<SelectItem value="operator">{t`Operator`}</SelectItem>
											<SelectItem value="viewer">{t`Viewer`}</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										{isSelfEdit && t`You cannot change your own role`}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Status`} *</FormLabel>
									<Select onValueChange={field.onChange} value={field.value} disabled={isSelfEdit}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="active">{t`Active`}</SelectItem>
											<SelectItem value="disabled">{t`Disabled`}</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										{isSelfEdit && t`You cannot disable your own account`}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t`Notes`}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t`Optional notes about this user...`}
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								{t`Cancel`}
							</Button>
							<Button type="submit">{user ? t`Update User` : t`Create User`}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
