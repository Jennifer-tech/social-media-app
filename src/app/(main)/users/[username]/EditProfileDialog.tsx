import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userData } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateProfileMutation } from "./mutations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { Camera } from "lucide-react";
import Resizer from "react-image-file-resizer";
import CropImageDialog from "@/components/CropImageDialog";

interface EditProfileDialogProps {
  user: userData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {

  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
    },
  });
  console.log("form", form);

  const mutation = useUpdateProfileMutation();
  console.log("mutation", mutation);

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);

  async function onSubmit(values: UpdateUserProfileValues) {
    const newAvatarFile = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`)
      : undefined;
    console.log("newAvatarFile", newAvatarFile);

    mutation.mutate(
      {
        values,
        avatar: newAvatarFile,
      },
      {
        onSuccess: () => {
          setCroppedAvatar(null);
          onOpenChange(false);
        },
        // onSuccess: async ([updatedUser, uploadResult]) => {
        //   console.log("✅ Upload Success! Updated User:", updatedUser);
        //   console.log("📤 Upload Result:", uploadResult);

        //   const newAvatarUrl = uploadResult?.[0]?.url || updatedUser.avatarUrl;
        //   console.log("🔗 New Avatar URL:", newAvatarUrl);

        //   setCroppedAvatar(null);
        //   await queryClient.invalidateQueries([
        //     "user-data",
        //     updatedUser.username,
        //   ]); // Refetch user data
        //   onOpenChange(false);
        // },

        // onError: (error) => {
        //   console.error("❌ Upload failed!", error);
        // },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Avatar</Label>
          <AvatarInput
            src={
              croppedAvatar
                ? URL.createObjectURL(croppedAvatar)
                : user.avatarUrl || avatarPlaceholder
            }
            onImageCropped={setCroppedAvatar}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
}

function AvatarInput({ src, onImageCropped }: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  // if you want to open the input without showing an clicking the input, it will be done with the code below.

  const fileInputRef = useRef<HTMLInputElement>(null);

  function onImageSelected(image: File | undefined) {
    if (!image) {
      console.error("❌ No image selected!");
      return;
    }

    console.log("📸 Selected image:", image);

    Resizer.imageFileResizer(
      image,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => {
        console.log("🔍 Resized image URI:", uri);
        setImageToCrop(uri as File);
      },
      "file",
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative block"
      >
        <Image
          src={src}
          alt="Avatar preview"
          width={150}
          height={150}
          className="size-32 flex-none rounded-full object-cover"
        />
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
          <Camera size={24} />
        </span>
      </button>
      {imageToCrop &&
        (console.log("🖼 Opening Crop Dialog"),
        (
          <CropImageDialog
            src={URL.createObjectURL(imageToCrop)}
            cropAspectRatio={1}
            onCropped={onImageCropped}
            onClose={() => {
              console.log("❌ Closing Crop Dialog");
              setImageToCrop(undefined);
              onImageCropped(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          />
        ))}
    </>
  );
}
