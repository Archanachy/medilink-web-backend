import fs from "fs";
import path from "path";

/**
 * Deletes a profile image file from the uploads directory
 * @param profileImagePath - The relative path to the image (e.g., /uploads/profile-images/filename.jpg)
 */
export function deleteProfileImage(profileImagePath: string | null | undefined): void {
    if (!profileImagePath) return;

    const filename = path.basename(profileImagePath);
    const imagePath = path.join(process.cwd(), "uploads", "profile-images", filename);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
}

/**
 * Determines if old image should be deleted when a new one is uploaded
 * Compares filenames to avoid deleting when multer overwrites the same file
 * @param oldImagePath - The existing image path
 * @param newFilename - The new uploaded file's filename
 * @returns true if old image should be deleted
 */
export function shouldDeleteOldImage(oldImagePath: string | null | undefined, newFilename: string): boolean {
    if (!oldImagePath) return false;
    const oldFilename = path.basename(oldImagePath);
    return oldFilename !== newFilename;
}

export function deleteUploadedFile(filePath: string | null | undefined, baseDir: string): void {
    if (!filePath) return;

    const filename = path.basename(filePath);
    const absolutePath = path.join(process.cwd(), baseDir, filename);

    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
}
