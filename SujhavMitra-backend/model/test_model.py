import pickle

# Load the homepage dict
with open("../models/movie_homepage_link.pkl", "rb") as f:
    homepage_df  = pickle.load(f)

movie_homepage_link = dict(zip(homepage_df['movie_id'], homepage_df['homepage']))
# Movie ID to check
movie_id = 49529

# Get homepage
homepage = movie_homepage_link.get(movie_id)
if homepage:
    print(f"Homepage for movie {movie_id}: {homepage}")
else:
    print(f"No homepage found for movie {movie_id}")
