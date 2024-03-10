import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
	StyleSheet,
	View,
	Button,
	TextInput,
	Pressable,
	Text,
	ActivityIndicator,
} from "react-native";
import { Toast } from "../../components";
import { useAuth } from "../../provider/AuthProvider";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Redirect } from "expo-router";
import { useUserStore } from "../../store";
import { UserDetails } from "../../store/userStore";

export default function Profile() {
	const { userDetails, setUserDetails } = useUserStore() as {
		userDetails: UserDetails;
		setUserDetails: (state: UserDetails) => void;
	};
	const [loading, setLoading] = useState(false);
	const [username, setUsername] = useState(userDetails.username);
	const [website, setWebsite] = useState(userDetails.website);
	const [avatarUrl, setAvatarUrl] = useState(userDetails.avatar_url);
	const [full_name, setFull_name] = useState(userDetails.full_name);
	const [imageLoading, setImageLoading] = useState(false);
	const { session } = useAuth();
	const toastRef = useRef();

	if (!session) {
		return <Redirect href={"/login"} />;
	}

	async function updateProfile({
		username,
		website,
		avatar_url,
		full_name,
	}: {
		username: string;
		website: string;
		avatar_url: string;
		full_name: string;
	}) {
		try {
			setLoading(true);
			if (!session?.user) throw new Error("No user on the session!");

			const updates = {
				id: session?.user.id,
				username,
				website,
				full_name,
				avatar_url,
				updated_at: new Date(),
			};

			const { error } = await supabase.from("profiles").upsert(updates);

			if (error) {
				throw error;
			}
			setUserDetails({
				username,
				website,
				avatar_url,
				full_name,
			});
			if (toastRef.current) {
				(toastRef.current as any).show({
					type: "success",
					text: "Profile updated",
					duration: 2000,
				});
			}
		} catch (error) {
			if (error instanceof Error) {
				if (toastRef.current) {
					(toastRef.current as any).show({
						type: "error",
						text: "Error updating profile",
						duration: 2000,
					});
				}
			}
		} finally {
			setLoading(false);
		}
	}

	const avatarChange = async () => {
		if (imageLoading) return;
		try {
			const { status } =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== "granted") {
				if (toastRef.current) {
					(toastRef.current as any).show({
						type: "error",
						text: "Permission denied!",
						duration: 2000,
					});
				}
				return;
			}
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
			});

			if (result.canceled) {
				return;
			}
			setImageLoading(true);
			const img = result.assets[0];
			const base64 = await FileSystem.readAsStringAsync(img.uri, {
				encoding: "base64",
			});
			const filePath = `${session.user!.id}/${new Date().getTime()}.${
				img.type === "image" ? "png" : "mp4"
			}`;
			const contentType =
				img.type === "image" ? "image/png" : "video/mp4";
			const { data, error } = await supabase.storage
				.from("files")
				.upload(filePath, decode(base64), { contentType });
			if (error) {
				if (toastRef.current) {
					(toastRef.current as any).show({
						type: "error",
						text: "Error uploading image",
						duration: 2000,
					});
				}
			} else {
				const output = supabase.storage
					.from("files")
					.getPublicUrl(data?.path);
				setAvatarUrl(output.data?.publicUrl);
				const updates = {
					id: session?.user.id,
					avatar_url: output.data?.publicUrl,
				};
				const { error } = await supabase
					.from("profiles")
					.upsert(updates);
				if (error) {
					if (toastRef.current) {
						(toastRef.current as any).show({
							type: "error",
							text: "Error updating image",
							duration: 2000,
						});
					}
				}
			}
			setUserDetails({
				...userDetails,
				avatar_url: avatarUrl,
			});
			if (toastRef.current) {
				(toastRef.current as any).show({
					type: "success",
					text: "Image updated",
					duration: 2000,
				});
			}
		} catch (error) {
			console.log(error);

			if (toastRef.current) {
				(toastRef.current as any).show({
					type: "error",
					text: "Error uploading image",
					duration: 2000,
				});
			}
		} finally {
			setImageLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Pressable
				style={styles.imageContainerStyle}
				onPress={async () => {
					avatarChange();
				}}
				disabled={imageLoading}
			>
				{imageLoading ? (
					<ActivityIndicator size="large" color="#000" />
				) : avatarUrl ? (
					<Image
						source={{ uri: avatarUrl }}
						style={{ width: 150, height: 150 }}
					/>
				) : (
					<Image
						source={{
							uri: "https://www.gravatar.com/avatar/?d=identicon",
						}}
						style={{ width: 150, height: 150 }}
					/>
				)}
			</Pressable>
			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Text style={styles.text}>Email : {session?.user?.email}</Text>
			</View>
			<View style={styles.verticallySpaced}>
				<TextInput
					value={username}
					onChangeText={(text) => setUsername(text)}
					style={styles.input}
					placeholder="username here"
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<TextInput
					value={full_name}
					onChangeText={(text) => setFull_name(text)}
					style={styles.input}
					placeholder="full name here"
				/>
			</View>
			<View style={styles.verticallySpaced}>
				<TextInput
					value={website}
					onChangeText={(text) => setWebsite(text)}
					style={styles.input}
					placeholder="website here"
				/>
			</View>

			<View style={[styles.verticallySpaced, styles.mt20]}>
				<Button
					title={loading ? "Loading ..." : "Update"}
					onPress={() =>
						updateProfile({
							username,
							website,
							avatar_url: avatarUrl,
							full_name,
						})
					}
					disabled={loading}
				/>
			</View>
			<Toast ref={toastRef} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 40,
		padding: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	verticallySpaced: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: "stretch",
	},
	imageContainerStyle: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: "center",
	},
	mt20: {
		marginTop: 20,
	},
	input: {
		height: 40,
		margin: 12,
		borderWidth: 1,
		padding: 10,
		width: "auto",
	},
	text: {
		padding: 10,
		width: "auto",
	},
});
