// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "../ui/textarea";
// import Fileuploader from "../shared/Fileuploader";
// import { PostValidation } from "@/lib/validation";
// import { Models } from "appwrite";
// import { useUserContext } from "@/context/AuthContext";
// import { useToast } from "../ui/use-toast";
// import { useNavigate } from "react-router-dom";
// import { useCreatePost } from "@/lib/react-query/queriesAndMutations";

// type PostFormProps = {
//   post?: Models.Document;
// };

// const PostForm = ({ post }: PostFormProps) => {
//     const { mutateAsync : createPost, isPending : isLoadingCreate} = useCreatePost();
//     const {user} = useUserContext();
//     const {toast} = useToast();
//     const navigate = useNavigate();


//   // 1. Define your form.
//   const form = useForm<z.infer<typeof PostValidation>>({
//     resolver: zodResolver(PostValidation),
//     defaultValues: {
//       caption: post ? post?.caption : "",
//       file: [],
//       location: post ? post?.location : "",
//       tags: post ? post?.tags.join(",") : "",
//     },
//   });

//   // 2. Define a submit handler.
//   async function onSubmit(values: z.infer<typeof PostValidation>) {
//     // Do something with the form values.
//     // ✅ This will be type-safe and validated.
//     const newPost =  await createPost({
//         ...values,
//         userId: user.id,
//     })
//     if (!newPost) {
//       toast({
//         title: "Error, Please try again",
//       })  
//     }
//     navigate('/');
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="flex flex-col gap-9 w-full max-w-5xl"
//       >
//         <FormField
//           control={form.control}
//           name="caption"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="shad-form_label">Caption</FormLabel>
//               <FormControl>
//                 <Textarea
//                   className="shad-textarea custom-scrollbar"
//                   placeholder="shadcn"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage className="shad-form_message" />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="file"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="shad-form_label">Add Photos</FormLabel>
//               <FormControl>
//                 <Fileuploader
//                   fieldChange={field.onChange}
//                   mediaUrl={post?.imageUrl}
//                 />
//               </FormControl>
//               <FormMessage className="shad-form_message" />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="location"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="shad-form_label">Add Location</FormLabel>
//               <FormControl>
//                 <Input type="text" className="shad-input" {...field} />
//               </FormControl>
//               <FormMessage className="shad-form_message" />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="tags"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="shad-form_label">
//                 Add tags (separated by comma " , ")
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   type="text"
//                   className="shad-input"
//                   placeholder="Art, Expression, Learning, etc."
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage className="shad-form_message" />
//             </FormItem>
//           )}
//         />
//         <div className="flex gap-4 items-center justify-end">
//           <Button type="button" className="shad-button_dark_4">
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             className="shad-button_primary whitespace-nowrap"
//           >
//             Submit
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// };

// export default PostForm;

import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/Fileuploader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loader from "../shared/Loader";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  // Query
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    // ACTION = UPDATE
    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...value,
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
      });

      if (!updatedPost) {
        toast({
          title: `${action} post failed. Please try again.`,
        });
      }
      return navigate(`/posts/${post.$id}`);
    }

    // ACTION = CREATE
    const newPost = await createPost({
      ...value,
      userId: user.id,
    });

    if (!newPost) {
      toast({
        title: `${action} post failed. Please try again.`,
      });
    }
    navigate("/");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full  max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Art, Expression, Learn"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;