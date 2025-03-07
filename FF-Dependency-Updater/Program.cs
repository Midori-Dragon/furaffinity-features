using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FF_Dependency_Updater;

#nullable enable
public class Program
{
    static async Task Main(string[] args)
    {
        var confirm = true;
        if (args.Contains("-y"))
            confirm = false;

        SendMessage("Loading Project Modules...");
        SendMessage();
        var commonWebpack = FindCommonWebpack("webpack.common.cjs");
        var projectFolder = Path.GetDirectoryName(commonWebpack);

        var webpackConfigs = Directory.GetFiles(projectFolder, "webpack.config.cjs", SearchOption.AllDirectories);
        List<ScriptInfo> scriptInfos = [];
        foreach (var webpackConfig in webpackConfigs)
        {
            var banner = await ExtractBannerAsync(webpackConfig);

            var name = GetValue(banner, @"//\s*@name\s+(.*)");
            SendMessage($"Loading {name}...");

            try
            {
                LibraryUrl[] dependencies = [.. GetValues(banner, @"//\s*@require\s+(.*)").Select(LibraryUrl.Parse)];
                var homepageUrl = ScriptUrl.Parse(GetValue(banner, @"//\s*@homepageURL\s+(.*)"));

                scriptInfos.Add(new ScriptInfo
                {
                    Name = name,
                    WebpackPath = webpackConfig,
                    Dependencies = dependencies,
                    HomepageUrl = homepageUrl
                });

                SendSuccess("Done!");
            }
            catch
            {
                SendError("Failed to load module.");
            }
            SendMessage();
        }
        SendSuccess("Finished!");
        SendMessage();

        if (scriptInfos.Count == 0)
        {
            SendMessage("No Modules found.");
            Exit(confirm);
        }

        SendMessage("Checking Module Dependencies for updates...");
        SendMessage();
        List<ScriptInfo> scriptInfosToUpdate = [];
        foreach (var scriptInfo in scriptInfos)
        {
            SendMessage($"Checking {scriptInfo.Name}...");
            var scriptInfosToCheck = scriptInfos.Where(x => x.Dependencies.Any(x => x.Id == scriptInfo.HomepageUrl?.Id));
            if (scriptInfosToCheck.Count() == 0)
            {
                SendMessage("No modules to update.");
                SendMessage();
                continue;
            }
            foreach (var scriptInfoToCheck in scriptInfosToCheck)
            {
                var dependencyToUpdate = scriptInfoToCheck.Dependencies.First(x => x.Id == scriptInfo.HomepageUrl!.Id);
                var oldVersion = dependencyToUpdate.VersionId;
                var newVersion = scriptInfo.LibraryUrl!.VersionId;

                if (oldVersion == newVersion)
                {
                    SendSuccess($"{scriptInfoToCheck.Name} is already up to date.");
                    continue;
                }

                dependencyToUpdate.VersionId = newVersion;
                if (!scriptInfosToUpdate.Contains(scriptInfoToCheck))
                    scriptInfosToUpdate.Add(scriptInfoToCheck);

                SendWarning($"Update {scriptInfoToCheck.Name} from {oldVersion} to {newVersion} needed.");
            }
            SendMessage();
        }

        if (scriptInfosToUpdate.Count == 0)
        {
            SendSuccess("All Modules are up to date!");
            Exit(confirm);
        }

        if (confirm)
        {
            Console.Write("Are you sure you want to update the found dependencies? (y/n) ");
            var input = string.Empty;
            while (input is not "y" and not "n")
            {
                input = Console.ReadLine()?.ToLower();
                if (string.IsNullOrWhiteSpace(input))
                    continue;

                if (input is not "y" and not "n")
                    SendMessage("Invalid input. Please enter 'y' or 'n'.");
            }

            if (input is not "y")
            {
                SendMessage("Update cancelled.");
                Exit(confirm);
            }
        }

        SendMessage("Updating Module Dependencies...");
        SendMessage();
        foreach (var scriptInfoToUpdate in scriptInfosToUpdate)
        {
            SendMessage($"Updating {scriptInfoToUpdate.Name}...");
            await ModifyBannerAsync(scriptInfoToUpdate.WebpackPath, scriptInfoToUpdate);
            SendSuccess("Done!");
            SendMessage();
        }

        SendSuccess("All Modules updated!");

        Exit(confirm);
    }

    static void Exit(bool confirm = true)
    {
        SendMessage();
        if (confirm)
        {
            SendMessage("Press any key to exit...");
            Console.ReadKey();
        }
        Environment.Exit(0);
    }

    static async Task<string> ExtractBannerAsync(string filePath)
    {
        if (!File.Exists(filePath))
            return string.Empty;

        var fileContent = await ReadFileWithoutLockingAsync(filePath);

        // Regular expression to capture the banner contents inside the BannerPlugin
        var regex = new Regex(@"new\s+webpack\.BannerPlugin\(\s*\{\s*banner:\s*`([\s\S]*?)`,", RegexOptions.Multiline);

        var match = regex.Match(fileContent);
        return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
    }

    static async Task ModifyBannerAsync(string filePath, ScriptInfo scriptInfo)
    {
        if (!File.Exists(filePath))
            return;

        var fileContent = await ReadFileWithoutLockingAsync(filePath);

        // Regular expression to capture the banner contents inside the BannerPlugin
        var regex = new Regex(@"new\s+webpack\.BannerPlugin\(\s*\{\s*banner:\s*`([\s\S]*?)`,", RegexOptions.Multiline);

        var match = regex.Match(fileContent);
        if (match.Success)
        {
            var originalBanner = match.Groups[1].Value.Trim();
            var updatedBanner = BuildUpdatedBanner(originalBanner, scriptInfo);

            // Replace the old banner with the new one
            var updatedContent = fileContent.Replace(originalBanner, updatedBanner);

            // Write the updated content back to the file
            File.WriteAllText(filePath, updatedContent);
        }
    }

    static string BuildUpdatedBanner(string originalBanner, ScriptInfo scriptInfo)
    {
        var bannerLines = originalBanner.Split(['\n'], StringSplitOptions.None).Select(line => line.Trim()).ToList();

        // Update the lines corresponding to ScriptInfo properties
        for (var i = 0; i < bannerLines.Count; i++)
        {
            var line = bannerLines[i];

            if (line.StartsWith("// @require"))
            {
                // Update the @require lines for dependencies
                if (scriptInfo.Dependencies != null && scriptInfo.Dependencies.Any())
                {
                    // Remove the current @require lines
                    bannerLines = [.. bannerLines.Where(x => !x.StartsWith("// @require"))];

                    for (var j = 0; j < scriptInfo.Dependencies.Length; j++, i++)
                    {
                        bannerLines.Insert(i, $"// @require     {scriptInfo.Dependencies[j]}");
                    }
                }
            }
        }

        // Rebuild the banner with the updated lines, preserving unchanged lines
        return string.Join("\n", bannerLines);
    }

    static async Task<string> ReadFileWithoutLockingAsync(string filePath)
    {
        const int delayMilliseconds = 200;
        const int maxTimeMilliseconds = 2000;
        var stopwatch = Stopwatch.StartNew();

        while (stopwatch.ElapsedMilliseconds < maxTimeMilliseconds)
        {
            using var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var sr = new StreamReader(fs);
            var content = await sr.ReadToEndAsync();

            if (!string.IsNullOrWhiteSpace(content))
            {
                return content; // Return content if it's not empty
            }

            await Task.Delay(delayMilliseconds); // Wait before retrying
        }

        return string.Empty; // Return empty string if max time is reached
    }

    static string[] GetValues(string text, string pattern)
    {
        var matches = Regex.Matches(text, pattern, RegexOptions.Multiline);
        return matches.Count != 0 ? [.. matches.Cast<Match>().Select(m => m.Groups[1].Value.Trim())] : [];
    }

    static string GetValue(string text, string pattern)
    {
        var match = Regex.Match(text, pattern, RegexOptions.Multiline);
        return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
    }

    static string FindCommonWebpack(string fileName)
    {
        var directory = AppDomain.CurrentDomain.BaseDirectory;

        var i = 0;
        while (directory != null && i < 6)
        {
            var filePath = Path.Combine(directory, fileName);
            if (File.Exists(filePath))
            {
                return filePath;
            }

            // Move to parent directory
            directory = Directory.GetParent(directory)?.FullName;
            i++;
        }

        return string.Empty; // File not found
    }

    static void SendMessage(string? text = null) => Console.WriteLine(text);
    static void SendSuccess(string? text = null) => SendInColor(ConsoleColor.DarkGreen, text);
    static void SendWarning(string? text = null) => SendInColor(ConsoleColor.DarkYellow, text);
    static void SendError(string? text = null) => SendInColor(ConsoleColor.Red, text);
    static void SendInColor(ConsoleColor color, string? text = null)
    {
        Console.ForegroundColor = color;
        Console.WriteLine(text);
        Console.ResetColor();
    }
}
