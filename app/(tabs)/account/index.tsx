import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useUserStore } from "../../../store";
import { supabase } from "../../../lib/supabase";
import { useFocusEffect, router } from "expo-router";
import { useAuth } from "../../../provider/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function Profile() {
	const { userDetails, user } = useUserStore();
	const [favourites, setFavourites] = useState(0);
	const [Writings, setWritings] = useState(0);
	const { signOut } = useAuth();

	const getData = async () => {
		//count entries where userid is equal to the current user
		const { data, error } = await supabase
			.from("stars")
			.select("id", { count: "exact" })
			.eq("user_id", user?.id);

		if (error) {
			console.log("error", error);
		} else {
			setFavourites(data?.length);
		}

		const { data: writings, error: writingsError } = await supabase
			.from("user_writings")
			.select("id", { count: "exact" })
			.eq("user_id", user?.id);

		if (writingsError) {
			console.log("error", writingsError);
		} else {
			setWritings(writings?.length);
		}
	};

	useFocusEffect(() => {
		getData();
	});

	return (
		<View style={styles.container}>
			<View style={{ width: "100%" }}>
				<LinearGradient
					colors={[ "#d2f4f9","#c0eff6","transparent"]}
					
					style={{
						height: 200,
						width: "100%",
						justifyContent: "center",
						alignItems: "center",
					}}
				/>
			</View>

			<View style={{ flex: 1, alignItems: "center" }}>
				<Image
					source={userDetails.avatar_url}
					style={{
						height: 155,
						width: 155,
						borderRadius: 999,
						borderColor: "#ffffff",
						borderWidth: 2,
						marginTop: -90,
					}}
				/>

				<Text
					style={{
						marginVertical: 8,
						fontWeight: "bold",
						fontSize: 20,
					}}
				>
					{userDetails.full_name || "Jane Doe"}
				</Text>
				<Text
					style={{
						marginVertical: 4,
						fontSize: 18,
						color: "#666",
					}}
				>
					{userDetails.username || "janedoe"}
				</Text>

				<View
					style={{
						flexDirection: "row",
						marginVertical: 6,
						alignItems: "center",
					}}
				>
					<Feather name="globe" size={16} color="#666" />
					<Text
						style={{
							marginLeft: 4,
							color: "#666",
							fontSize: 18,
						}}
					>
						{userDetails.website || "janedoe.com"}
					</Text>
				</View>

				<View
					style={{
						paddingVertical: 16,
						flexDirection: "row",
						gap: 24,
						paddingHorizontal: 20,
						width: "100%",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<View
						style={{
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							{Writings}
						</Text>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							Writings
						</Text>
					</View>

					<View
						style={{
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							{favourites}
						</Text>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							Stars
						</Text>
					</View>

					<View
						style={{
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							{userDetails.coins}
						</Text>
						<Text
							style={{
								fontSize: 18,
							}}
						>
							Coins
						</Text>
					</View>
				</View>

				<View style={{ flexDirection: "row", paddingTop: 16 }}>
					<Pressable
						style={{
							width: 124,
							height: 36,
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 10,
							marginHorizontal: 20 * 2,
							borderColor: "#000",
							borderWidth: 1,
						}}
						onPress={() => router.navigate("/profile")}
					>
						<Text>Edit Profile</Text>
					</Pressable>

					<Pressable
						style={{
							width: 124,
							height: 36,
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#ff0000",
							borderRadius: 10,
							marginHorizontal: 20 * 2,
						}}
					>
						<Text
							style={{
								color: "#fff",
							}}
							onPress={signOut}
						>
							Sign Out
						</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex:1,
		backgroundColor: "#fff",
	},
	pressableStyle: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
	},
	textStyle: {
		fontSize: 20,
	},
});
