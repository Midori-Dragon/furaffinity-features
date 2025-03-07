namespace FF_Dependency_Updater;

#nullable enable
public sealed class ScriptInfo
{
    public string Name { get; set; } = string.Empty;
    public string WebpackPath { get; set; } = string.Empty;
    public LibraryUrl[] Dependencies { get; set; } = [];
    public ScriptUrl? HomepageUrl
    {
        get => _homepageUrl;
        set
        {
            _homepageUrl = value;
            try
            {
                LibraryUrl = _homepageUrl?.ToLibraryUrlAsync().Result;
            }
            catch { }
        }
    }
    private ScriptUrl? _homepageUrl;
    public LibraryUrl? LibraryUrl { get; set; }
}
