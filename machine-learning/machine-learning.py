import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity

with open('input.json', 'r') as file:
    liked_songs_dict = json.load(file)


# Load and preprocess data
df = pd.read_csv("Spotify_Song_Attributes.csv")
df.drop_duplicates(inplace=True)

# Feature Engineering
df['energy_loudness_ratio'] = df['energy'] / df['loudness']

# Features for clustering
features = ['danceability', 'energy', 'key', 'loudness', 'mode', 'speechiness', 
            'acousticness', 'instrumentalness', 'liveness', 'valence', 
            'tempo', 'duration_ms', 'energy_loudness_ratio']

# Preprocessing
X = df[features].fillna(df[features].mean())
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# PCA for Dimensionality Reduction
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)

# K-Means Clustering
kmeans = KMeans(n_clusters=10, random_state=42)
df['cluster'] = kmeans.fit_predict(X_pca)


# Filter for matching tracks
query = " or ".join([f"(trackName == '{track}' and artistName == '{artist}')" for artist, track in liked_songs_dict.items()])
matched_liked_songs = df.query(query)

# Calculate the average vector for liked songs
liked_song_indices = matched_liked_songs.index
average_liked_vector = np.mean(X_scaled[liked_song_indices], axis=0)

# Identify clusters of liked songs
liked_clusters = matched_liked_songs['cluster'].unique()

# Find similar songs within these clusters using cosine similarity
all_recommendations = []
for cluster in liked_clusters:
    cluster_indices = df[df['cluster'] == cluster].index
    cluster_vectors = X_scaled[cluster_indices]
    
    # Calculate cosine similarities within the cluster
    cosine_similarities = cosine_similarity([average_liked_vector], cluster_vectors)[0]
    
    # Sort songs in the cluster by similarity and take the top 10
    sorted_indices = np.argsort(cosine_similarities)[::-1][:5]
    for idx in sorted_indices:
        song_idx = cluster_indices[idx]
        song = df.iloc[song_idx][['artistName', 'trackName']].tolist()
        if song not in liked_songs_dict.values():
            all_recommendations.append(song)

unique_recommendations = []
for rec in all_recommendations:
    artist_name, track_name = rec
    if not ((matched_liked_songs['artistName'] == artist_name) & (matched_liked_songs['trackName'] == track_name)).any():
        unique_recommendations.append(rec)

final_df = pd.DataFrame()
for artist, song in unique_recommendations:
    final_df = pd.concat([final_df, df[(df["artistName"] == artist) & (df["trackName"] == song)]], ignore_index=True)


final_df[["trackName","artistName","id","uri","track_href","analysis_url"]].to_json()