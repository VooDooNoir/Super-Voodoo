from tools.image_generation import image_generate

if __name__ == "__main__":
    result = image_generate(
        prompt="A futuristic cityscape at sunset with flying cars and neon lights",
        style="photorealistic",
        width=512,
        height=512,
        num_images=1
    )
    print(f"Image generation result: {result}")