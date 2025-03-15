CREATE TABLE cached_subtitles (
    id SERIAL PRIMARY KEY,
    audio_file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    subtitles TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(audio_file_name, file_size)
);


