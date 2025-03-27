import { ProofResponse } from "@/types/battleship";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.log("NEXT_PROOF_API_URL is not defined");
  throw new Error("NEXT_PROOF_API_URL is not defined");
}

export async function verifyBattleship(
  username: string,
  data: {
    ships_sunk: number;
    total_shots: number;
    hit_percentage: number;
    winner: boolean;
  }
): Promise<ProofResponse> {
  try {
    console.log("Verifying battleship proof...");
    console.log("Username:", username);
    console.log("Game result data:", data);

    const response = await axios.post<ProofResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/battleship/generate-proof`,
      {
        username,
        game_result: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else if (response.status === 400) {
      throw new Error("Bad request. Please check the input parameters.");
    } else if (response.status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(`Unexpected error: ${response.status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error: ${error.message}`);
    } else {
      if (error instanceof Error) {
        throw new Error(`Unexpected error: ${error.message}`);
      } else {
        throw new Error("Unexpected error");
      }
    }
  }
}
