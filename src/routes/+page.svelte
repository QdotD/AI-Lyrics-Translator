<script>
  import { onMount } from "svelte";

  let currentlyPlaying = "Not playing";
  let isAuthenticated = false;

  const clientId = import.meta.env.VITE_CLIENT_ID;
  const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);

  const scope = encodeURIComponent(
    "user-read-currently-playing user-modify-playback-state"
  ); // add additional scopes as needed

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;

  const authenticate = () => {
    window.location.href = authUrl;
  };

  const logout = () => {
    isAuthenticated = false;
    window.location.href = "http://localhost:3000/"; // Redirect to home page
  };

  const fetchCurrentlyPlaying = async (accessToken) => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      currentlyPlaying =
        data.item.name +
        " by " +
        data.item.artists.map((artist) => artist.name).join(", ");
    } catch (error) {
      console.error("Error fetching currently playing song: ", error);
      currentlyPlaying = "Error fetching song";
    }
  };

  const nextTrack = async (accessToken) => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setTimeout(() => fetchCurrentlyPlaying(accessToken), 1000); // Wait 1 second before fetching the currently playing song
    } catch (error) {
      console.error("Error skipping to next track: ", error);
    }
  };

  const previousTrack = async (accessToken) => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setTimeout(() => fetchCurrentlyPlaying(accessToken), 1000); // Wait 1 second before fetching the currently playing song
    } catch (error) {
      console.error("Error skipping to previous track: ", error);
    }
  };

  const pauseTrack = async (accessToken) => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("Error pausing track: ", error);
    }
  };

  const playTrack = async (accessToken) => {
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("Error playing track: ", error);
    }
  };

  let accessToken = "";

  onMount(() => {
    // Extract access_token from URL if present
    const params = new URLSearchParams(window.location.search);
    accessToken = params.get("access_token");
    if (accessToken) {
      isAuthenticated = true;
      fetchCurrentlyPlaying(accessToken);
    }
  });
</script>

{#if isAuthenticated}
  <button on:click={logout}>Logout</button>
  <button on:click={() => previousTrack(accessToken)}>Previous Track</button>
  <button on:click={() => pauseTrack(accessToken)}>Pause</button>
  <button on:click={() => playTrack(accessToken)}>Play</button>
  <button on:click={() => nextTrack(accessToken)}>Next Track</button>
  <p>Currently playing: {currentlyPlaying}</p>
{:else}
  <button on:click={authenticate}>Log In with Spotify</button>
{/if}
