using System;
using System.IO;
using System.Threading.Tasks;

using FF_Dependency_Lib;

namespace FF_Dependency_Updater;

#nullable enable
public sealed class LibraryUrl
{
    public ulong Id { get; set; }
    public ulong VersionId { get; set; }
    public string Name { get; set; } = string.Empty;

    public override string ToString() => $"https://update.greasyfork.org/scripts/{Id}/{VersionId}/{Name.Replace(' ', '-')}.js";
    public static LibraryUrl Parse(string url)
    {
        var parts = url.Split('/');

        var idPart = parts[parts.Length - 3];
        var versionPart = parts[parts.Length - 2];
        var namePart = parts[parts.Length - 1];

        Console.WriteLine($"LibraryUrl: {idPart}/{versionPart}/{namePart}");

        return new LibraryUrl
        {
            Id = ulong.Parse(idPart),
            VersionId = ulong.Parse(versionPart),
            Name = Path.GetFileNameWithoutExtension(namePart)
        };
    }
    public static async Task<LibraryUrl> FromScriptUrlAsync(ScriptUrl scriptUrl) => await GreasyForkHelper.GetLibraryUrlFromScriptUrl(scriptUrl);
}
